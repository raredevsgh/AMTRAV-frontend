"use client";

import React from "react";
import Image from "next/image";

interface AccessoryVisualProps {
  image: string;
  swatchImage?: string;
  name: string;
  colorName: string;
}

export default function AccessoryVisual({
  image,
  swatchImage,
  name,
  colorName,
}: AccessoryVisualProps) {
  const src = swatchImage || image;
  if (!src) return null;

  return (
    <div className="relative flex size-full items-center justify-center">
      <Image
        src={src}
        alt={`${name} — ${colorName}`}
        fill
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
        className="object-contain"
        priority={false}
      />
    </div>
  );
}
