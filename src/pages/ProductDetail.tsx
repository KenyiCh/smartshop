import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Heart,
  TrendingDown,
  TrendingUp,
  ExternalLink,
  Store,
  BellRing,
  Crown,
  Truck,
  ShieldCheck,
  CreditCard,
  CalendarClock,
  Clock,
  AlertTriangle,
  BadgeCheck,
  SearchX,
  Info,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import PriceChart from "@/components/PriceChart";
import AddToWishlistDialog from "@/components/AddToWishlistDialog";
import PriceAlertDialog from "@/components/PriceAlertDialog";
import { useToast } from "@/hooks/use-toast";
import { contentModerationService } from "@/services/contentModerationService";
import { formatPrice } from "@/utils/priceUtils";
import { getAlertForProduct } from "@/utils/premium";
import {
  finalPrice,
  formatUpdatedAt,
  getProductById,
  historyRange,
  isListPriceSuspicious,
  shippingLabel,
  sortedOffers,
  trendPct,
  type Product,
  type StoreOffer,
} from "@/data/products";

const ProductNotFound = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-10 text-center space-y-4">
          <SearchX className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Producto no encontrado</h1>
          <p className="text-muted-foreground">
            El producto que buscas no existe o ya no está en nuestro catálogo.
          </p>
          <Button asChild>
            <Link to="/products">Ver todos los productos</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

const OfferCard = ({ product, offer, isBest }: { product: Product; offer: StoreOffer; isBest: boolean }) => {
  const total = finalPrice(offer);
  const suspicious = isListPriceSuspicious(product, offer);

  return (
    <Card className={isBest ? "border-2 border-primary" : undefined}>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <Store className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-lg">{offer.store}</h3>
                {isBest && <Badge>Mejor precio final</Badge>}
                {offer.official && (
                  <Badge variant="outline" className="text-green-700 border-green-600">
                    <BadgeCheck className="h-3 w-3 mr-1" /> Tienda oficial
                  </Badge>
                )}
                {offer.affiliate && (
                  <Badge
                    variant="secondary"
                    title="SmartShop podría recibir una comisión si compras desde este enlace. No cambia el orden de la lista."
                  >
                    Enlace de afiliado
                  </Badge>
                )}
              </div>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                {offer.storeRating.toFixed(1)} calificación de la tienda
              </div>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-muted-foreground">Precio final</div>
            <div className="text-2xl font-bold">S/ {formatPrice(total)}</div>
            <div className="text-xs text-muted-foreground">
              S/ {formatPrice(offer.price)}
              {offer.shipping.cost > 0 ? ` + S/ ${offer.shipping.cost} de envío` : " · sin costo de envío"}
            </div>
            {offer.listPrice && (
              <div className={`text-xs mt-1 ${suspicious ? "text-amber-700 font-medium" : "text-muted-foreground"}`}>
                «Antes» según la tienda: <span className="line-through">S/ {formatPrice(offer.listPrice)}</span>
              </div>
            )}
          </div>
        </div>

        {suspicious && (
          <div className="flex gap-2 rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            El precio «antes» de S/ {formatPrice(offer.listPrice!)} no aparece en nuestro historial de 3 meses (máximo
            S/ {formatPrice(historyRange(product).max)}). El descuento podría ser menor de lo que dice la tienda.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex gap-2">
            <Truck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">{shippingLabel(offer.shipping)}</span>
              <div className="text-xs text-muted-foreground">{offer.shipping.eta}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{offer.warranty}</span>
          </div>
          <div className="flex gap-2">
            <CreditCard className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            {offer.cardPrice ? (
              <span>
                <span className="font-medium">S/ {formatPrice(offer.cardPrice.price)}</span> solo con{" "}
                {offer.cardPrice.card}
              </span>
            ) : (
              <span className="text-muted-foreground">Sin precio exclusivo con tarjeta</span>
            )}
          </div>
          <div className="flex gap-2">
            <CalendarClock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            {offer.installments ? (
              <span>
                Hasta {offer.installments.months} cuotas sin intereses {offer.installments.conditions}
              </span>
            ) : (
              <span className="text-muted-foreground">Sin cuotas sin intereses</span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
          <div className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
            <Clock className="h-3 w-3 shrink-0" />
            <span>Precio tomado el {formatUpdatedAt(offer.updatedAt)} ·</span>
            <a
              href={offer.url}
              target="_blank"
              rel={offer.affiliate ? "noopener noreferrer sponsored" : "noopener noreferrer"}
              className="underline truncate"
              title={offer.url}
            >
              {new URL(offer.url).hostname.replace(/^www\./, "")}
            </a>
          </div>
          <Button size="sm" asChild>
            <a
              href={offer.url}
              target="_blank"
              rel={offer.affiliate ? "noopener noreferrer sponsored" : "noopener noreferrer"}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver en {offer.store}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const product = getProductById(id);

  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviewErrors, setReviewErrors] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    setIsLoggedIn(!!userData);
  }, []);

  useEffect(() => {
    if (product) setHasAlert(!!getAlertForProduct(product.id));
    setUserRating(0);
    setReview("");
    setReviewErrors([]);
  }, [product]);

  if (!product) return <ProductNotFound />;

  const offers = sortedOffers(product);
  const best = offers[0];
  const bestTotal = finalPrice(best);
  const range = historyRange(product);
  const trend = trendPct(product);

  // Mock wishlists data
  const mockWishlists = [
    { id: 1, name: "Tecnología", itemCount: 2 },
    { id: 2, name: "Hogar", itemCount: 1 },
  ];

  const requireLogin = (description: string) => {
    toast({ title: "Iniciar sesión requerido", description, variant: "destructive" });
  };

  const handleWishlistClick = () => {
    if (!isLoggedIn) return requireLogin("Debes iniciar sesión para agregar productos a tu lista de deseos");
    setShowWishlistDialog(true);
  };

  const handleAlertClick = () => {
    if (!isLoggedIn) return requireLogin("Debes iniciar sesión para crear alertas de precio");
    setShowAlertDialog(true);
  };

  const handleAddToWishlist = (wishlistId: number, p: unknown) => {
    console.log("Adding product to wishlist:", wishlistId, p);
  };

  const handleCreateWishlistAndAdd = (name: string, p: unknown) => {
    console.log("Creating new wishlist and adding product:", name, p);
  };

  const validateReviewForm = () => {
    const errors: string[] = [];
    if (userRating === 0) errors.push("La calificación es obligatoria");
    if (!review.trim()) errors.push("El comentario es obligatorio");
    setReviewErrors(errors);
    return errors.length === 0;
  };

  const submitReview = async () => {
    if (!isLoggedIn) return requireLogin("Debes iniciar sesión para escribir una reseña");

    if (!validateReviewForm()) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReview(true);

    const moderationResult = contentModerationService.moderateContent(review.trim(), userRating);
    if (!moderationResult.isAppropriate) {
      setIsSubmittingReview(false);
      toast({
        title: "Contenido inapropiado detectado",
        description: moderationResult.reason,
        variant: "destructive",
      });
      if (moderationResult.suggestedChanges) setReviewErrors(moderationResult.suggestedChanges);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Reseña enviada:", { productId: product.id, rating: userRating, review: review.trim() });
    setUserRating(0);
    setReview("");
    setReviewErrors([]);
    setIsSubmittingReview(false);
    toast({ title: "Reseña enviada", description: "Tu reseña ha sido enviada exitosamente" });
  };

  const wishlistProduct = {
    id: product.id,
    name: product.name,
    image: product.image,
    currentPrice: bestTotal,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <img src={product.image} alt={product.name} className="w-full h-72 sm:h-96 object-cover rounded-lg" />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-muted-foreground">
                {product.brand} • {product.model}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 font-medium">{product.rating}</span>
              </div>
              <span className="text-muted-foreground">({product.totalReviews} reseñas)</span>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-lg">Mejor precio final:</span>
                <div
                  className={`flex items-center space-x-1 text-sm font-medium ${
                    trend < 0 ? "text-green-600" : trend > 0 ? "text-red-500" : "text-muted-foreground"
                  }`}
                >
                  {trend < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  <span>
                    {trend > 0 ? "+" : ""}
                    {trend}% en 4 semanas
                  </span>
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">S/ {formatPrice(bestTotal)}</div>
              <p className="text-sm text-muted-foreground">
                en {best.store} · {shippingLabel(best.shipping).toLowerCase()} · comparando {offers.length} tiendas
                oficiales
              </p>
              <p className="text-sm text-muted-foreground">
                Rango en los últimos 3 meses: S/ {formatPrice(range.min)} – S/ {formatPrice(range.max)}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleWishlistClick} className="flex-1">
                <Heart className="h-5 w-5 mr-2" />
                Agregar a deseos
              </Button>
              <Button variant="outline" onClick={handleAlertClick} className="flex-1">
                <BellRing className="h-5 w-5 mr-2" />
                {hasAlert ? "Editar alerta" : "Crear alerta"}
                <Crown className="h-4 w-4 ml-2 text-amber-500" />
              </Button>
              <Button className="flex-1" asChild>
                <a
                  href={best.url}
                  target="_blank"
                  rel={best.affiliate ? "noopener noreferrer sponsored" : "noopener noreferrer"}
                >
                  Ver mejor oferta
                </a>
              </Button>
            </div>

            <p className="text-muted-foreground">{product.description}</p>
          </div>
        </div>

        <Tabs defaultValue="stores" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stores">Tiendas</TabsTrigger>
            <TabsTrigger value="price-history">Historial</TabsTrigger>
            <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>

          <TabsContent value="stores" className="space-y-4">
            <div className="flex gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Ordenado siempre por <strong>precio final</strong> (precio online + envío a domicilio). El precio con
                tarjeta se muestra aparte porque solo aplica si tienes esa tarjeta. Prototipo: precios y horas son datos
                de ejemplo.
              </span>
            </div>
            <div className="grid gap-4">
              {offers.map((offer, index) => (
                <OfferCard key={offer.store} product={product} offer={offer} isBest={index === 0} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="price-history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de precios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PriceChart data={product.priceHistory} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-md bg-muted/50 p-3">
                    <div className="text-muted-foreground">Hoy</div>
                    <div className="font-semibold">S/ {formatPrice(product.priceHistory.at(-1)!.price)}</div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <div className="text-muted-foreground">Más bajo (3 meses)</div>
                    <div className="font-semibold">S/ {formatPrice(range.min)}</div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-3">
                    <div className="text-muted-foreground">Más alto (3 meses)</div>
                    <div className="font-semibold">S/ {formatPrice(range.max)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications">
            <Card>
              <CardHeader>
                <CardTitle>Especificaciones técnicas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 py-2 border-b">
                      <span className="font-medium">{key}</span>
                      <span className="text-muted-foreground text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Escribir una reseña</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isLoggedIn ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Debes iniciar sesión para escribir una reseña</p>
                    <Button variant="outline" onClick={() => navigate("/login")}>
                      Iniciar sesión
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Calificación *
                        {reviewErrors.some((error) => error.includes("calificación")) && (
                          <span className="text-red-500 ml-1">- Campo obligatorio</span>
                        )}
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setUserRating(star)} className="p-1">
                            <Star
                              className={`h-6 w-6 ${
                                star <= userRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Comentario *
                        {reviewErrors.some((error) => error.includes("comentario")) && (
                          <span className="text-red-500 ml-1">- Campo obligatorio</span>
                        )}
                      </label>
                      <Textarea
                        placeholder="Escribe tu reseña del producto..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className={reviewErrors.some((error) => error.includes("comentario")) ? "border-red-500" : ""}
                        rows={4}
                        maxLength={500}
                      />
                      <div className="text-sm text-muted-foreground mt-1">{review.length}/500 caracteres</div>
                    </div>

                    {reviewErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <h4 className="text-sm font-medium text-red-800 mb-2">
                          Por favor corrige los siguientes problemas:
                        </h4>
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {reviewErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button onClick={submitReview} disabled={isSubmittingReview}>
                      {isSubmittingReview ? "Enviando..." : "Enviar reseña"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              {product.reviews.length === 0 && (
                <p className="text-center text-muted-foreground py-6">
                  Aún no hay reseñas de este producto. ¡Sé el primero en opinar!
                </p>
              )}
              {product.reviews.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{r.user}</h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(`${r.date}T12:00:00`).toLocaleDateString("es-PE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{r.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <AddToWishlistDialog
        open={showWishlistDialog}
        onClose={() => setShowWishlistDialog(false)}
        product={wishlistProduct}
        wishlists={mockWishlists}
        onAddToWishlist={handleAddToWishlist}
        onCreateWishlistAndAdd={handleCreateWishlistAndAdd}
      />

      <PriceAlertDialog
        open={showAlertDialog}
        onClose={() => setShowAlertDialog(false)}
        product={product}
        onSaved={() => setHasAlert(true)}
      />
    </div>
  );
};

export default ProductDetail;
