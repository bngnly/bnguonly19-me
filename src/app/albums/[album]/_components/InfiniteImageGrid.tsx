"use client";

import { useEffect, useRef, useState } from "react";
import ImageGrid from "./ImageGrid";
import { Photo } from "@/types/types";

interface Props {
    initialPhotos: Photo[];
    initialOffset: number;
    pageSize: number;
    album: string;
    hasNextPage: boolean;
}

export default function InfiniteImageGrid({
    initialPhotos,
    initialOffset,
    pageSize,
    album,
    hasNextPage: initialHasNext,
}: Props) {
    const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
    const [offset, setOffset] = useState(initialOffset);
    const [hasNextPage, setHasNextPage] = useState(initialHasNext);
    const [loading, setLoading] = useState(false);

    const loaderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!hasNextPage) return;

        const observer = new IntersectionObserver(async (entries) => {
            const entry = entries[0];

            if (!entry.isIntersecting || loading) return;

            setLoading(true);

            try {
                const res = await fetch(
                    `/api/photos?album=${album}&offset=${offset + pageSize}&limit=${pageSize}`
                );

                const data = await res.json();

                setPhotos((prev) => [...prev, ...data.photos]);
                setOffset((prev) => prev + pageSize);
                setHasNextPage(data.hasNextPage);
            } catch (err) {
                console.error("Failed to load more photos", err);
            } finally {
                setLoading(false);
            }
        });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [album, offset, pageSize, hasNextPage, loading]);

    return (
        <>
            <ImageGrid photos={photos} />

            {hasNextPage && (
                <div
                    ref={loaderRef}
                    className="h-16 flex items-center justify-center text-gray-500"
                >
                    {loading ? "Loading..." : "Scroll for more"}
                </div>
            )}
        </>
    );
}