import { Button } from "@/components/ui/button";

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: () => void;
}

export function SettingsSection({ title, description, children, onSave }: SettingsSectionProps) {
  return (
    <section className="bg-card rounded-lg border border-border shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="p-6">
        {children}
      </div>
      {onSave && (
        <div className="bg-muted/30 px-6 py-4 border-t border-border flex justify-end">
          <Button onClick={onSave}>Save Changes</Button>
        </div>
      )}
    </section>
  );
}
