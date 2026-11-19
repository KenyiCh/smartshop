import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, BellRing, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/utils/priceUtils";
import { minFinalPrice, type Product, type StoreName } from "@/data/products";
import {
  activatePremiumTrial,
  CHANNEL_LABELS,
  FREQUENCY_LABELS,
  getAlertForProduct,
  isPremium,
  saveAlert,
  type AlertChannel,
  type AlertFrequency,
} from "@/utils/premium";

interface PriceAlertDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  onSaved?: () => void;
}

const PriceAlertDialog = ({ open, onClose, product, onSaved }: PriceAlertDialogProps) => {
  const { toast } = useToast();
  const best = minFinalPrice(product);
  const productStores = product.offers.map((o) => o.store);

  const [premium, setPremium] = useState(isPremium());
  const [targetPrice, setTargetPrice] = useState(Math.round(best * 0.9));
  const [minDiscount, setMinDiscount] = useState(10);
  const [stores, setStores] = useState<StoreName[]>(productStores);
  const [channel, setChannel] = useState<AlertChannel>("email");
  const [frequency, setFrequency] = useState<AlertFrequency>("immediate");
  const [consent, setConsent] = useState(false);

  // Cargar la alerta existente, si hay una, al abrir.
  useEffect(() => {
    if (!open) return;
    setPremium(isPremium());
    const existing = getAlertForProduct(product.id);
    if (existing) {
      setTargetPrice(existing.targetPrice);
      setMinDiscount(existing.minDiscount);
      setStores(existing.stores);
      setChannel(existing.channel);
      setFrequency(existing.frequency);
      setConsent(true);
    } else {
      setTargetPrice(Math.round(best * 0.9));
      setMinDiscount(10);
      setStores(productStores);
      setChannel("email");
      setFrequency("immediate");
      setConsent(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product.id]);

  const handleActivateTrial = () => {
    activatePremiumTrial();
    setPremium(true);
    toast({
      title: "Prueba Premium activada (simulada)",
      description: "En el prototipo no se realiza ningún cobro.",
    });
  };

  const toggleStore = (store: StoreName, checked: boolean) => {
    setStores((prev) => (checked ? [...prev, store] : prev.filter((s) => s !== store)));
  };

  const canSave = targetPrice > 0 && stores.length > 0 && consent;

  const handleSave = () => {
    if (!canSave) return;
    saveAlert({
      productId: product.id,
      productName: product.name,
      targetPrice,
      minDiscount,
      stores,
      channel,
      frequency,
      consent: true,
    });
    toast({
      title: "Alerta guardada",
      description: `Te avisaríamos por ${CHANNEL_LABELS[channel].toLowerCase()} si ${product.name} baja a S/ ${formatPrice(targetPrice)} o menos. (Prototipo: la alerta no se envía.)`,
    });
    onSaved?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            Alerta de precio
            <Badge className="bg-amber-500 hover:bg-amber-500 text-white">
              <Crown className="h-3 w-3 mr-1" /> Premium
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {product.name} · mejor precio final hoy: S/ {formatPrice(best)}
          </DialogDescription>
        </DialogHeader>

        {!premium ? (
          <div className="space-y-4 py-2">
            <p className="text-sm">
              Las <strong>alertas a medida</strong> son parte de SmartShop Premium: eliges el precio objetivo, el
              descuento mínimo, las tiendas, el canal y la frecuencia.
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Gratis: comparar tiendas, historial, listas de deseos y reseñas.</li>
              <li>Premium: alertas a medida y recomendaciones con IA.</li>
            </ul>
            <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground flex gap-2">
              <Info className="h-4 w-4 shrink-0" />
              Premium cuesta S/ 20 al mes, pero el pago no está habilitado en el piloto. La prueba es simulada y no pide datos de pago.
            </div>
            <DialogFooter>
              <Button variant="outline" asChild>
                <Link to="/planes">Ver planes</Link>
              </Button>
              <Button onClick={handleActivateTrial}>
                <Crown className="h-4 w-4 mr-2" /> Probar gratis (simulado)
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target">Precio objetivo (S/)</Label>
                <Input
                  id="target"
                  type="number"
                  min={1}
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">Avisar si el precio final llega a este monto o menos.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Descuento mínimo (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min={0}
                  max={90}
                  value={minDiscount}
                  onChange={(e) => setMinDiscount(Math.min(90, Math.max(0, Number(e.target.value) || 0)))}
                />
                <p className="text-xs text-muted-foreground">Comparado con el historial, no con el precio «antes».</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tiendas</Label>
              <div className="grid grid-cols-2 gap-2">
                {productStores.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm rounded-md border p-2 cursor-pointer">
                    <Checkbox checked={stores.includes(s)} onCheckedChange={(c) => toggleStore(s, c === true)} />
                    {s}
                  </label>
                ))}
              </div>
              {stores.length === 0 && <p className="text-xs text-destructive">Elige al menos una tienda.</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Canal</Label>
                <Select value={channel} onValueChange={(v: AlertChannel) => setChannel(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CHANNEL_LABELS).map(([k, l]) => (
                      <SelectItem key={k} value={k}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <Select value={frequency} onValueChange={(v: AlertFrequency) => setFrequency(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREQUENCY_LABELS).map(([k, l]) => (
                      <SelectItem key={k} value={k}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={consent} onCheckedChange={(c) => setConsent(c === true)} className="mt-0.5" />
              <span>
                Acepto que SmartShop guarde este producto, mi precio objetivo y el canal elegido solo para enviarme esta
                alerta. Puedo borrarla cuando quiera (Ley 29733).
              </span>
            </label>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" asChild>
                <Link to="/notification-settings">Ver mis alertas</Link>
              </Button>
              <Button onClick={handleSave} disabled={!canSave}>
                Guardar alerta
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PriceAlertDialog;
