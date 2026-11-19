import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Info, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  activatePremiumTrial,
  cancelPremiumTrial,
  isPremium,
  PREMIUM_EVENT,
  PREMIUM_MONTHLY_PRICE,
} from "@/utils/premium";
import { getCurrentUser } from "@/utils/session";

const FREE_FEATURES = [
  "Comparar precios de tiendas oficiales en una sola vista",
  "Historial de precios de cada producto",
  "Listas de deseos",
  "Reseñas de otros compradores",
];

const PREMIUM_FEATURES = [
  "Todo lo del plan Gratis",
  "Alertas a medida: precio objetivo y descuento mínimo",
  "Elige tiendas favoritas, canal (correo, web o WhatsApp) y frecuencia",
  "Recomendaciones con IA",
];

const Plans = () => {
  const [premium, setPremium] = useState(isPremium());
  const isLoggedIn = !!getCurrentUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setPremium(isPremium());
    window.addEventListener(PREMIUM_EVENT, sync);
    return () => window.removeEventListener(PREMIUM_EVENT, sync);
  }, []);

  const handleTrial = () => {
    if (!isLoggedIn) {
      toast({
        title: "Iniciar sesión requerido",
        description: "Inicia sesión para activar la prueba Premium.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    activatePremiumTrial();
    toast({ title: "Prueba Premium activada (simulada)", description: "No se realizó ningún cobro." });
  };

  const handleCancel = () => {
    cancelPremiumTrial();
    toast({ title: "Volviste al plan Gratis", description: "Tus alertas guardadas quedan en pausa." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Planes de SmartShop</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comparar precios es gratis. Premium te avisa cuando el producto que quieres llega al precio que buscas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gratis */}
          <Card className={!premium ? "border-2 border-primary" : undefined}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-2xl">Gratis</CardTitle>
                {!premium && isLoggedIn && <Badge>Tu plan actual</Badge>}
              </div>
              <CardDescription>Para comparar antes de comprar.</CardDescription>
              <div className="pt-2">
                <span className="text-4xl font-bold">S/ 0</span>
                <span className="text-muted-foreground"> /mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {premium ? (
                <Button variant="outline" className="w-full" onClick={handleCancel}>
                  Volver al plan Gratis
                </Button>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/products">Empezar a comparar</Link>
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Premium */}
          <Card className={premium ? "border-2 border-amber-500" : "border-2 border-amber-300"}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Crown className="h-6 w-6 text-amber-500" /> Premium
                </CardTitle>
                {premium && <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Tu plan actual</Badge>}
              </div>
              <CardDescription>Para quien planifica una compra grande (CyberWow, Black Friday).</CardDescription>
              <div className="pt-2">
                <span className="text-4xl font-bold">S/ {PREMIUM_MONTHLY_PRICE}</span>
                <span className="text-muted-foreground"> /mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex gap-2 text-sm">
                    <Check className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {premium ? (
                <Button className="w-full" asChild>
                  <Link to="/notification-settings">Ver mis alertas</Link>
                </Button>
              ) : (
                <>
                  <Button className="w-full" disabled title="El pago no está habilitado durante el piloto">
                    <Lock className="h-4 w-4 mr-2" />
                    Pagar S/ {PREMIUM_MONTHLY_PRICE} al mes · no disponible
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleTrial}>
                    <Crown className="h-4 w-4 mr-2 text-amber-500" /> Activar prueba gratis (simulada)
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 flex gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            SmartShop está en etapa piloto: <strong>el pago no está habilitado</strong> y no pedimos datos de tarjeta. La
            prueba Premium es simulada y las alertas no se envían todavía.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Plans;
