import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, FolderOpen, Trash2, Clock, Trophy, Scroll, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { SessionManager, type GameSession } from '../lib/sessionManager';

interface SessionManagerProps {
  onLoadSession: (session: GameSession) => void;
  onClose: () => void;
}

export function SessionManagerComponent({ onLoadSession, onClose }: SessionManagerProps) {
  const [sessions, setSessions] = useState<GameSession[]>(SessionManager.getAllSessions());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleLoadSession = (session: GameSession) => {
    onLoadSession(session);
    onClose();
  };

  const handleDeleteSession = (sessionId: string) => {
    SessionManager.deleteSession(sessionId);
    setSessions(SessionManager.getAllSessions());
    setShowDeleteConfirm(null);
  };

  const autoSave = SessionManager.loadAutoSave();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Load Session
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto Save */}
            {autoSave && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Auto Save</h3>
                <SessionCard
                  session={autoSave}
                  onLoad={handleLoadSession}
                  onDelete={() => SessionManager.clearAutoSave()}
                  showDeleteConfirm={showDeleteConfirm === autoSave.id}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                />
              </div>
            )}

            {/* Manual Saves */}
            {sessions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Saved Games</h3>
                <div className="space-y-3">
                  {sessions
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onLoad={handleLoadSession}
                        onDelete={handleDeleteSession}
                        showDeleteConfirm={showDeleteConfirm === session.id}
                        setShowDeleteConfirm={setShowDeleteConfirm}
                      />
                    ))}
                </div>
              </div>
            )}

            {sessions.length === 0 && !autoSave && (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No saved sessions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

interface SessionCardProps {
  session: GameSession;
  onLoad: (session: GameSession) => void;
  onDelete: (sessionId: string) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (id: string | null) => void;
}

function SessionCard({
  session,
  onLoad,
  onDelete,
  showDeleteConfirm,
  setShowDeleteConfirm,
}: SessionCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      home: 'Home',
      intro: 'Story Beginning',
      challenge: 'Skill Check',
      'action-choice': 'Choosing Action',
      resolution: 'Resolution',
      transition: 'Transition',
      ended: 'Ended',
    };
    return labels[phase] || phase;
  };

  return (
    <Card className="border-primary/30 hover:border-primary/60 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{session.name}</h4>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                {getPhaseLabel(session.phase)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(session.timestamp)}
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {session.glory}
              </div>
              <div className="flex items-center gap-1">
                <Scroll className="w-3 h-3" />
                {session.narrativeDice}
              </div>
            </div>

            {session.activeCards.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Cards: {session.activeCards.map((c) => c.name).join(', ')}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {showDeleteConfirm ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(session.id)}
                >
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="default" size="sm" onClick={() => onLoad(session)}>
                  <FolderOpen className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(session.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SaveSessionDialogProps {
  onSave: (name: string) => void;
  onClose: () => void;
}

export function SaveSessionDialog({ onSave, onClose }: SaveSessionDialogProps) {
  const [sessionName, setSessionName] = useState(
    `Session ${new Date().toLocaleDateString()}`
  );

  const handleSave = () => {
    onSave(sessionName);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Name</label>
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1">
                Save
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
