import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options?: IntersectionObserverInit) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                element.classList.add("scroll-reveal-visible");
                observer.unobserve(element);
            }
        }, {
            threshold: 0.1,
            ...options,
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [options]);

    return ref;
}

export function useScrollRevealWithDelay<T extends HTMLElement = HTMLDivElement>(delay: number = 0, options?: IntersectionObserverInit) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                if (delay > 0) {
                    setTimeout(() => {
                        element.classList.add("scroll-reveal-visible");
                    }, delay);
                } else {
                    element.classList.add("scroll-reveal-visible");
                }
                observer.unobserve(element);
            }
        }, {
            threshold: 0.1,
            ...options,
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [delay, options]);

    return ref;
}

