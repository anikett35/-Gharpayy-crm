import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCreateVisit, useLeads, useProperties, useAgents } from '@/hooks/useCrmData';
import { toast } from 'sonner';

const AddVisitDialog = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    lead_id: '',
    property_id: '',
    assigned_staff_id: '',
    scheduled_at: '',
  });

  const createVisit = useCreateVisit();
  const { data: leads } = useLeads();
  const { data: properties } = useProperties();
  const { data: agents } = useAgents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lead_id || !form.property_id || !form.scheduled_at) {
      toast.error('Lead, property, and date are required');
      return;
    }

    try {
      await createVisit.mutateAsync({
        lead_id: form.lead_id,
        property_id: form.property_id,
        assigned_staff_id: form.assigned_staff_id || null,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
      });
      toast.success('Visit scheduled!');
      setOpen(false);
      setForm({ lead_id: '', property_id: '', assigned_staff_id: '', scheduled_at: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule visit');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 text-xs">
          <Plus size={13} /> Schedule Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-display">Schedule Visit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Lead *</Label>
            <Select value={form.lead_id} onValueChange={v => setForm(f => ({ ...f, lead_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
              <SelectContent>
                {leads?.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name} — {l.phone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Property *</Label>
            <Select value={form.property_id} onValueChange={v => setForm(f => ({ ...f, property_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
              <SelectContent>
                {properties?.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Assign Staff</Label>
            <Select value={form.assigned_staff_id} onValueChange={v => setForm(f => ({ ...f, assigned_staff_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
              <SelectContent>
                {agents?.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Date & Time *</Label>
            <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={createVisit.isPending}>
              {createVisit.isPending ? 'Scheduling...' : 'Schedule Visit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVisitDialog;
