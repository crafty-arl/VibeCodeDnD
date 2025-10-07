import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Check, X, Mic, Sparkles } from 'lucide-react';
import { NarratorManager, type NarratorPreset } from '../lib/narratorManager';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
// Removed unused Tabs imports

interface NarratorManagerProps {
  isOpen?: boolean;
  onClose: () => void;
}

export function NarratorManagerComponent({ isOpen = true, onClose }: NarratorManagerProps) {
  const [narrators, setNarrators] = useState<NarratorPreset[]>(NarratorManager.getAllNarrators());
  const [activeNarratorId, setActiveNarratorIdState] = useState(NarratorManager.getActiveNarratorId());
  const [editingNarrator, setEditingNarrator] = useState<NarratorPreset | null>(null);
  const [showNarratorEditor, setShowNarratorEditor] = useState(false);

  const handleCreateNarrator = () => {
    setEditingNarrator(null);
    setShowNarratorEditor(true);
  };

  const handleEditNarrator = (narrator: NarratorPreset) => {
    setEditingNarrator(narrator);
    setShowNarratorEditor(true);
  };

  const handleDeleteNarrator = (narratorId: string) => {
    NarratorManager.deleteNarrator(narratorId);
    setNarrators(NarratorManager.getAllNarrators());
  };

  const handleSelectActiveNarrator = (narratorId: string) => {
    NarratorManager.setActiveNarrator(narratorId);
    setActiveNarratorIdState(narratorId);
  };

  const handleSaveNarrator = (narrator: NarratorPreset) => {
    if (editingNarrator) {
      NarratorManager.updateNarrator(narrator.id, {
        name: narrator.name,
        description: narrator.description,
        personality: narrator.personality,
        tone: narrator.tone,
        style: narrator.style,
        systemPrompt: narrator.systemPrompt,
      });
    } else {
      NarratorManager.createNarrator(
        narrator.name,
        narrator.description,
        narrator.personality,
        narrator.tone,
        narrator.style,
        narrator.systemPrompt
      );
    }
    setNarrators(NarratorManager.getAllNarrators());
    setShowNarratorEditor(false);
    setEditingNarrator(null);
  };

  if (showNarratorEditor) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={onClose}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[90vh] overflow-auto p-4"
            >
              <NarratorEditor
                narrator={editingNarrator}
                onSave={handleSaveNarrator}
                onCancel={() => {
                  setShowNarratorEditor(false);
                  setEditingNarrator(null);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-3xl max-h-[90vh] overflow-auto p-4"
          >
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              <span>Narrator Manager</span>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Choose the narrator's personality and style for your adventures.
            </p>
            <Button onClick={handleCreateNarrator} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Narrator
            </Button>
          </div>

          <div className="space-y-3">
            {narrators.map((narrator) => (
              <NarratorCard
                key={narrator.id}
                narrator={narrator}
                isActive={narrator.id === activeNarratorId}
                onSelect={() => handleSelectActiveNarrator(narrator.id)}
                onEdit={() => handleEditNarrator(narrator)}
                onDelete={() => handleDeleteNarrator(narrator.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface NarratorCardProps {
  narrator: NarratorPreset;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function NarratorCard({ narrator, isActive, onSelect, onEdit, onDelete }: NarratorCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isDefault = narrator.id.startsWith('default_') || narrator.id === 'epic_fantasy' ||
    narrator.id === 'snarky_dm' || narrator.id === 'wholesome_guide' ||
    narrator.id === 'noir_detective' || narrator.id === 'chaotic_goblin';

  return (
    <Card className={`${isActive ? 'border-primary' : 'border-muted'} transition-colors`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{narrator.name}</h4>
              {isActive && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Active
                </span>
              )}
              {isDefault && (
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{narrator.description}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-muted">
                <strong>Personality:</strong> {narrator.personality}
              </span>
              <span className="px-2 py-1 rounded bg-muted">
                <strong>Tone:</strong> {narrator.tone}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {!isActive && (
              <Button variant="outline" size="sm" onClick={onSelect}>
                <Check className="w-4 h-4" />
              </Button>
            )}
            {!isDefault && (
              <>
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="w-4 h-4" />
                </Button>
                {showDeleteConfirm ? (
                  <>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        onDelete();
                        setShowDeleteConfirm(false);
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NarratorEditorProps {
  narrator: NarratorPreset | null;
  onSave: (narrator: NarratorPreset) => void;
  onCancel: () => void;
}

function NarratorEditor({ narrator, onSave, onCancel }: NarratorEditorProps) {
  const [name, setName] = useState(narrator?.name || '');
  const [description, setDescription] = useState(narrator?.description || '');
  const [personality, setPersonality] = useState(narrator?.personality || '');
  const [tone, setTone] = useState(narrator?.tone || '');
  const [style, setStyle] = useState(narrator?.style || '');
  const [systemPrompt, setSystemPrompt] = useState(narrator?.systemPrompt || '');

  const handleSave = () => {
    if (!name.trim() || !systemPrompt.trim()) return;

    const narratorToSave: NarratorPreset = narrator
      ? {
          ...narrator,
          name,
          description,
          personality,
          tone,
          style,
          systemPrompt,
          updatedAt: Date.now(),
        }
      : {
          id: `narrator_${Date.now()}`,
          name,
          description,
          personality,
          tone,
          style,
          systemPrompt,
          voice: 'george' as const,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

    onSave(narratorToSave);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>{narrator ? 'Edit Narrator' : 'Create New Narrator'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Narrator Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Epic Storyteller"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this narrator's style"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Personality</label>
              <Input
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Witty, dramatic, mysterious..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Dark humor, heroic, sarcastic..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Style</label>
            <Input
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="Concise and punchy, flowing prose..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">System Prompt (AI Instructions)</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a narrator for GLESOLAS..."
              className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <p className="text-xs text-muted-foreground">
              This prompt controls how the AI generates narrative content. Be specific about tone, style, and length.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={!name.trim() || !systemPrompt.trim()}
              className="flex-1"
            >
              {narrator ? 'Update Narrator' : 'Create Narrator'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
