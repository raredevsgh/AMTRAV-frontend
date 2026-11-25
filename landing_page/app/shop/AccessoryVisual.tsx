"use client";

import React from "react";
import Image from "next/image";

interface AccessoryVisualProps {
  image: string;
  swatchImage?: string;
  name: string;
  colorName: string;
}

const ASSET_VERSION = "20261125b";

function withAssetVersion(path: string): string {
  if (!path.startsWith("/images/")) return path;
  return path.includes("?") ? `${path}&v=${ASSET_VERSION}` : `${path}?v=${ASSET_VERSION}`;
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
    <div className="flex size-full items-center justify-center bg-white p-3 sm:p-4">
      <div className="relative size-full">
        <Image
          src={withAssetVersion(src)}
          alt={`${name} — ${colorName}`}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />
      </div>
    </div>
  );
}
