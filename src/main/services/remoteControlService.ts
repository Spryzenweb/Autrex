import { createClient, RealtimeChannel } from '@supabase/supabase-js'
import { lcuConnector } from './lcuConnector'

const SUPABASE_URL = 'https://czlahmuvhlcdxgmtarja.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bGFobXV2aGxjZHhnbXRhcmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MzYzMjcsImV4cCI6MjA3NjExMjMyN30.tVDtK9b7pdzuGqR8g9qdwA-Ob4b0lMYLma_J-A4sEQI'

interface RemoteSession {
  sessionCode: string
  isActive: boolean
  expiresAt: string
}

interface RemoteCommand {
  id: string
  commandType:
    | 'pick'
    | 'ban'
    | 'hover'
    | 'start_queue'
    | 'stop_queue'
    | 'accept_trade'
    | 'decline_trade'
    | 'update_positions'
  championId: number
  executed: boolean
  additionalData?: any
}

// Database row type (snake_case from Supabase)
interface RemoteCommandRow {
  id: string
  command_type: string
  champion_id: number
  executed: boolean
  session_code: string
  created_at?: string
}

export class RemoteControlService {
  private static instance: RemoteControlService
  private supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  private currentSession: RemoteSession | null = null
  private commandChannel: RealtimeChannel | null = null
  private stateChannel: RealtimeChannel | null = null

  private constructor() {
    /* empty */
  }

  static getInstance(): RemoteControlService {
    if (!RemoteControlService.instance) {
      RemoteControlService.instance = new RemoteControlService()
    }
    return RemoteControlService.instance
  }

  /**
   * Generate a unique 6-character session code
   */
  private generateSessionCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Start remote control session
   */
  async startSession(hwid: string): Promise<RemoteSession> {
    // Generate unique session code
    const sessionCode = this.generateSessionCode()

    // Create session in database
    const { data, error } = await this.supabase
      .from('remote_sessions')
      .insert([
        {
          session_code: sessionCode,
          user_id: hwid,
          hardware_id: hwid,
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('[RemoteControl] Failed to create session:', error)
      throw new Error('Failed to create remote session')
    }

    this.currentSession = {
      sessionCode: data.session_code,
      isActive: true,
      expiresAt: data.expires_at
    }

    // Subscribe to commands
    await this.subscribeToCommands(sessionCode)

    // Start heartbeat
    this.startHeartbeat()

    console.log('[RemoteControl] Session started:', sessionCode)
    return this.currentSession
  }

  /**
   * Subscribe to remote commands
   */
  private async subscribeToCommands(sessionCode: string): Promise<void> {
    // Unsubscribe from previous channel
    if (this.commandChannel) {
      await this.supabase.removeChannel(this.commandChannel)
    }

    console.log('[RemoteControl] 🔔 Setting up subscription for session:', sessionCode)

    // Subscribe to new commands
    this.commandChannel = this.supabase
      .channel(`remote_commands:${sessionCode}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'remote_commands',
          filter: `session_code=eq.${sessionCode}`
        },
        (payload) => {
          console.log('[RemoteControl] 📨 New command received from Supabase:', {
            event: payload.eventType,
            table: payload.table,
            new: payload.new
          })

          // Convert snake_case to camelCase
          const dbRow = payload.new as RemoteCommandRow
          const command: RemoteCommand = {
            id: dbRow.id,
            commandType: dbRow.command_type as RemoteCommand['commandType'],
            championId: dbRow.champion_id,
            executed: dbRow.executed,
            additionalData: (dbRow as any).additional_data
          }

          console.log('[RemoteControl] 🔄 Converted command:', command)
          this.executeCommand(command)
        }
      )
      .subscribe((status) => {
        console.log('[RemoteControl] 📡 Subscription status changed:', status)
        if (status === 'SUBSCRIBED') {
          console.log(
            '[RemoteControl] ✅ Successfully subscribed to commands for session:',
            sessionCode
          )
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[RemoteControl] ❌ Channel error - failed to subscribe')
        } else if (status === 'TIMED_OUT') {
          console.error('[RemoteControl] ❌ Subscription timed out')
        } else if (status === 'CLOSED') {
          console.log('[RemoteControl] 🔌 Channel closed')
        }
      })

    console.log('[RemoteControl] 🎯 Subscription configured, waiting for commands...')
  }

  /**
   * Execute remote command
   */
  private async executeCommand(command: RemoteCommand): Promise<void> {
    if (command.executed) {
      return
    }

    try {
      console.log('[RemoteControl] Executing command:', command.commandType, command.championId)

      // Execute based on command type
      if (command.commandType === 'pick') {
        await lcuConnector.pickChampion(command.championId)
      } else if (command.commandType === 'ban') {
        await lcuConnector.banChampion(command.championId)
      } else if (command.commandType === 'hover') {
        await lcuConnector.hoverChampion(command.championId)
      } else if (command.commandType === 'start_queue') {
        // championId field is used to store queueId
        await lcuConnector.startQueue(command.championId)
      } else if (command.commandType === 'stop_queue') {
        await lcuConnector.stopQueue()
      } else if (command.commandType === 'accept_trade') {
        // Trade ID is stored in championId field
        await lcuConnector.acceptTrade(command.championId)
      } else if (command.commandType === 'decline_trade') {
        // Trade ID is stored in championId field
        await lcuConnector.declineTrade(command.championId)
      } else if (command.commandType === 'update_positions') {
        // Position preferences stored in additional_data
        const additionalData = command.additionalData || {}
        const primary = additionalData.primary_position
        const secondary = additionalData.secondary_position
        if (primary && secondary) {
          await lcuConnector.updatePositionPreferences(primary, secondary)
        }
      }

      // Mark command as executed
      await this.supabase.from('remote_commands').update({ executed: true }).eq('id', command.id)

      console.log('[RemoteControl] Command executed successfully')
    } catch (error) {
      console.error('[RemoteControl] Failed to execute command:', error)
    }
  }

  /**
   * Update lobby state for web interface (premades, position preferences)
   */
  async updateLobbyState(lobby: any): Promise<void> {
    if (!this.currentSession) {
      return
    }

    // Check if lobby is null or undefined
    if (!lobby) {
      console.log('[RemoteControl] Lobby is null, skipping update')
      return
    }

    try {
      console.log('[RemoteControl] ===== LOBBY STATE UPDATE =====')

      const members = lobby.members || []
      const localPlayer = members.find((m: any) => m.isLocalPlayer)

      const lobbyState = {
        session_code: this.currentSession.sessionCode,
        lobby_members: members.map((member: any) => ({
          summonerId: member.summonerId,
          summonerName: member.summonerName || 'Unknown',
          isLocalPlayer: member.isLocalPlayer || false,
          isLeader: member.isLeader || false,
          firstPositionPreference: member.firstPositionPreference || '',
          secondPositionPreference: member.secondPositionPreference || ''
        })),
        queue_id: lobby.gameConfig?.queueId || 0,
        local_player_position_preferences: {
          first: localPlayer?.firstPositionPreference || '',
          second: localPlayer?.secondPositionPreference || ''
        },
        updated_at: new Date().toISOString()
      }

      console.log('[RemoteControl] Lobby state:', {
        members_count: lobbyState.lobby_members.length,
        queue_id: lobbyState.queue_id,
        local_player_positions: lobbyState.local_player_position_preferences
      })

      // Check if record exists
      const { data: existingData } = await this.supabase
        .from('lobby_state')
        .select('session_code')
        .eq('session_code', this.currentSession.sessionCode)
        .single()

      let result
      if (existingData) {
        result = await this.supabase
          .from('lobby_state')
          .update(lobbyState)
          .eq('session_code', this.currentSession.sessionCode)
      } else {
        result = await this.supabase.from('lobby_state').insert(lobbyState)
      }

      if (result.error) {
        console.error('[RemoteControl] Lobby state error:', result.error)
      }

      console.log('[RemoteControl] ===== END LOBBY UPDATE =====')
    } catch (error) {
      console.error('[RemoteControl] Failed to update lobby state:', error)
    }
  }

  /**
   * Update champ select state for web interface
   */
  async updateChampSelectState(session: any): Promise<void> {
    if (!this.currentSession) {
      console.log('[RemoteControl] No active session, skipping state update')
      return
    }

    try {
      console.log('[RemoteControl] ===== CHAMP SELECT SESSION UPDATE =====')

      // Get local player cell ID
      const localPlayerCellId = session.localPlayerCellId

      // Determine phase - use multiple strategies
      let phase = 'PLANNING'

      // Strategy 1: Check timer.phase
      if (session.timer?.phase) {
        phase = session.timer.phase
        console.log('[RemoteControl] Phase from timer:', phase)
      }

      // Strategy 2: Check actions for incomplete actions
      if (session.actions && Array.isArray(session.actions)) {
        const flatActions = session.actions.flat()

        // Find any incomplete ban action
        const incompleteBan = flatActions.find((a: any) => a.type === 'ban' && !a.completed)

        // Find any incomplete pick action
        const incompletePick = flatActions.find((a: any) => a.type === 'pick' && !a.completed)

        console.log('[RemoteControl] Action analysis:', {
          totalActions: flatActions.length,
          incompleteBan: incompleteBan
            ? `ID:${incompleteBan.id} Actor:${incompleteBan.actorCellId}`
            : 'none',
          incompletePick: incompletePick
            ? `ID:${incompletePick.id} Actor:${incompletePick.actorCellId}`
            : 'none'
        })

        // If we have incomplete bans, we're in ban phase
        if (incompleteBan) {
          phase = 'BAN_PHASE'
          console.log('[RemoteControl] Phase set to BAN_PHASE (incomplete ban found)')
        }
        // If we have incomplete picks and no incomplete bans, we're in pick phase
        else if (incompletePick) {
          phase = 'PICK_PHASE'
          console.log('[RemoteControl] Phase set to PICK_PHASE (incomplete pick found)')
        }
      }

      // Extract pick order from actions
      const pickOrderSequence: Array<{ cellId: number; pickOrder: number }> = []
      let pickOrderCounter = 1

      if (session.actions && Array.isArray(session.actions)) {
        for (const actionGroup of session.actions) {
          if (Array.isArray(actionGroup)) {
            for (const action of actionGroup) {
              if (
                action.type === 'pick' &&
                !pickOrderSequence.find((p) => p.cellId === action.actorCellId)
              ) {
                pickOrderSequence.push({
                  cellId: action.actorCellId,
                  pickOrder: pickOrderCounter++
                })
              }
            }
          }
        }
      }

      // Find current active pick
      let currentActivePickIndex = -1
      if (session.actions && Array.isArray(session.actions)) {
        const flatActions = session.actions.flat()
        const activePickAction = flatActions.find((a: any) => a.type === 'pick' && !a.completed)
        if (activePickAction) {
          currentActivePickIndex = pickOrderSequence.findIndex(
            (p) => p.cellId === activePickAction.actorCellId
          )
        }
      }

      const state = {
        session_code: this.currentSession.sessionCode,
        phase: phase,
        my_team: (session.myTeam || []).map((member: any) => ({
          ...member,
          summonerName: member.gameName || member.summonerName || 'Unknown',
          summonerTag: member.tagLine || member.summonerTag || ''
        })),
        enemy_team: (session.theirTeam || []).map((member: any) => ({
          ...member,
          summonerName: member.gameName || member.summonerName || 'Unknown',
          summonerTag: member.tagLine || member.summonerTag || ''
        })),
        actions: session.actions || [],
        local_player_cell_id: localPlayerCellId,
        pick_order_sequence: pickOrderSequence,
        current_active_pick_index: currentActivePickIndex,
        banned_champions: [
          ...(session.bans?.myTeamBans || []).map((championId: number) => ({
            championId,
            teamId: 100
          })),
          ...(session.bans?.theirTeamBans || []).map((championId: number) => ({
            championId,
            teamId: 200
          }))
        ],
        updated_at: new Date().toISOString()
      }

      console.log('[RemoteControl] Final state:', {
        session_code: state.session_code,
        phase: state.phase,
        my_team_count: state.my_team.length,
        enemy_team_count: state.enemy_team.length,
        actions_count: state.actions.length,
        local_player_cell_id: state.local_player_cell_id,
        banned_champions_count: state.banned_champions.length,
        pick_order_count: pickOrderSequence.length,
        current_active_pick_index: currentActivePickIndex,
        sample_summoner_names: state.my_team.slice(0, 2).map((m: any) => m.summonerName)
      })

      // Check if record exists
      const { data: existingData } = await this.supabase
        .from('champ_select_state')
        .select('session_code')
        .eq('session_code', this.currentSession.sessionCode)
        .single()

      let result
      if (existingData) {
        // Update existing record
        result = await this.supabase
          .from('champ_select_state')
          .update(state)
          .eq('session_code', this.currentSession.sessionCode)
          .select()
      } else {
        // Insert new record
        result = await this.supabase.from('champ_select_state').insert(state).select()
      }

      if (result.error) {
        console.error('[RemoteControl] Supabase error:', result.error)
        throw result.error
      }

      console.log('[RemoteControl] Supabase response:', result.data)
      console.log('[RemoteControl] ===== END SESSION UPDATE =====')
    } catch (error) {
      console.error('[RemoteControl] Failed to update champ select state:', error)
    }
  }

  /**
   * Update game status (summoner info, game phase, etc.)
   */
  async updateGameStatus(
    gamePhase: string,
    summonerData?: any,
    ownedChampionIds?: number[]
  ): Promise<void> {
    if (!this.currentSession) {
      return
    }

    try {
      const additionalData: any = {}

      if (summonerData) {
        // Handle both nested and flat summoner data structures
        const summoner = summonerData.summoner || summonerData

        // Parse displayName to get name and tag (format: "Name#TAG")
        const displayName = summoner.displayName || summoner.gameName || 'Unknown'
        let summonerName = displayName
        let summonerTag = ''

        if (displayName.includes('#')) {
          const parts = displayName.split('#')
          summonerName = parts[0]
          summonerTag = parts[1]
        }

        additionalData.summoner_name = summonerName
        additionalData.summoner_tag = summonerTag
        additionalData.profile_icon_id = summoner.profileIconId || 0
        additionalData.summoner_level = summoner.summonerLevel || 0
        additionalData.puuid = summoner.puuid || ''
      }

      if (ownedChampionIds && ownedChampionIds.length > 0) {
        additionalData.owned_champion_ids = ownedChampionIds
      }

      const status = {
        session_code: this.currentSession.sessionCode,
        game_phase: gamePhase,
        additional_data: additionalData,
        updated_at: new Date().toISOString()
      }

      console.log('[RemoteControl] Updating game status:', {
        phase: gamePhase,
        hasSummoner: !!summonerData,
        summonerName: additionalData.summoner_name,
        summonerTag: additionalData.summoner_tag,
        hasOwnedChampions: !!ownedChampionIds,
        ownedChampionsCount: ownedChampionIds?.length || 0
      })

      // Check if record exists
      const { data: existingData } = await this.supabase
        .from('game_status')
        .select('session_code')
        .eq('session_code', this.currentSession.sessionCode)
        .single()

      let result
      if (existingData) {
        // Update existing record
        result = await this.supabase
          .from('game_status')
          .update(status)
          .eq('session_code', this.currentSession.sessionCode)
      } else {
        // Insert new record
        result = await this.supabase.from('game_status').insert(status)
      }

      if (result.error) {
        console.error('[RemoteControl] Game status error:', result.error)
        throw result.error
      }

      console.log('[RemoteControl] Game status updated successfully')
    } catch (error) {
      console.error('[RemoteControl] Failed to update game status:', error)
    }
  }

  /**
   * Start heartbeat to keep session alive
   */
  private startHeartbeat(): void {
    setInterval(async () => {
      if (!this.currentSession) {
        return
      }

      try {
        await this.supabase
          .from('remote_sessions')
          .update({ last_heartbeat: new Date().toISOString() })
          .eq('session_code', this.currentSession.sessionCode)
      } catch (error) {
        console.error('[RemoteControl] Heartbeat failed:', error)
      }
    }, 30000) // Every 30 seconds
  }

  /**
   * Stop remote control session
   */
  async stopSession(): Promise<void> {
    if (!this.currentSession) {
      return
    }

    try {
      // Deactivate session
      await this.supabase
        .from('remote_sessions')
        .update({ is_active: false })
        .eq('session_code', this.currentSession.sessionCode)

      // Unsubscribe from channels
      if (this.commandChannel) {
        await this.supabase.removeChannel(this.commandChannel)
      }
      if (this.stateChannel) {
        await this.supabase.removeChannel(this.stateChannel)
      }

      console.log('[RemoteControl] Session stopped')
      this.currentSession = null
    } catch (error) {
      console.error('[RemoteControl] Failed to stop session:', error)
    }
  }

  /**
   * Get current session
   */
  getCurrentSession(): RemoteSession | null {
    return this.currentSession
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    return this.currentSession !== null && this.currentSession.isActive
  }
}

export const remoteControlService = RemoteControlService.getInstance()
