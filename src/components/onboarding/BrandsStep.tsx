
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { OnboardingData } from "../OnboardingFlow";
import {
  siApple,
  siAsus,
  siDell,
  siHp,
  siHuawei,
  siLenovo,
  siLg,
  siRazer,
  siSamsung,
  siSony,
  siXiaomi,
  type SimpleIcon,
} from "simple-icons";

interface BrandsStepProps {
  data: OnboardingData;
  onUpdate: (data: Partial<OnboardingData>) => void;
}

// Logos incluidos en la app (paquete simple-icons): no dependen de enlaces externos.
// Las marcas sin ícono muestran su inicial.
const brands: { id: string; name: string; icon?: SimpleIcon }[] = [
  { id: "apple", name: "Apple", icon: siApple },
  { id: "samsung", name: "Samsung", icon: siSamsung },
  { id: "sony", name: "Sony", icon: siSony },
  { id: "lg", name: "LG", icon: siLg },
  { id: "xiaomi", name: "Xiaomi", icon: siXiaomi },
  { id: "huawei", name: "Huawei", icon: siHuawei },
  { id: "dell", name: "Dell", icon: siDell },
  { id: "hp", name: "HP", icon: siHp },
  { id: "lenovo", name: "Lenovo", icon: siLenovo },
  { id: "asus", name: "ASUS", icon: siAsus },
  { id: "logitech", name: "Logitech" },
  { id: "razer", name: "Razer", icon: siRazer },
];

/** Usa el color de la marca salvo que sea muy claro (p. ej. blanco), que no se vería. */
const iconColor = (hex: string) => {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "currentColor" : `#${hex}`;
};

const BrandLogo = ({ name, icon }: { name: string; icon?: SimpleIcon }) =>
  icon ? (
    <svg role="img" aria-label={name} viewBox="0 0 24 24" className="w-12 h-12 text-foreground">
      <path d={icon.path} fill={iconColor(icon.hex)} />
    </svg>
  ) : (
    <div
      aria-label={name}
      className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold"
    >
      {name.charAt(0)}
    </div>
  );

const BrandsStep = ({ data, onUpdate }: BrandsStepProps) => {
  const [selectedBrands, setSelectedBrands] = useState<string[]>(data.brands);

  useEffect(() => {
    onUpdate({ brands: selectedBrands });
  }, [selectedBrands, onUpdate]);

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Selecciona las marcas que prefieres para recibir recomendaciones más precisas
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {brands.map((brand) => (
          <Card
            key={brand.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedBrands.includes(brand.id)
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() => toggleBrand(brand.id)}
          >
            <CardContent className="p-3 text-center">
              <div className="flex flex-col items-center space-y-2">
                <BrandLogo name={brand.name} icon={brand.icon} />
                <span className="text-sm font-medium">{brand.name}</span>
                <Checkbox
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => {}}
                  className="pointer-events-none"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Seleccionadas: {selectedBrands.length} {selectedBrands.length === 1 ? "marca" : "marcas"}
      </p>
    </div>
  );
};

export default BrandsStep;
