"use client";

import {
  createContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./archive.module.css";

export const ArchiveFloatingContext = createContext(false);

type Props = {
  enabled: boolean;
  path?: string;
  triggerSelector?: string;
  controls: ReactNode;
  children: ReactNode;
};

export function ArchiveBrowser({
  enabled,
  path = "/articles",
  triggerSelector,
  controls,
  children,
}: Props) {
  if (!enabled)
    return (
      <>
        {controls}
        {children}
      </>
    );
  return (
    <FloatingArchive
      path={path}
      triggerSelector={triggerSelector}
      controls={controls}
    >
      {children}
    </FloatingArchive>
  );
}

function FloatingArchive({
  path = "/articles",
  triggerSelector,
  controls,
  children,
}: Omit<Props, "enabled">) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef(false);
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const anchor = anchorRef.current;
    const surface = controlsRef.current;
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!root || !anchor || !surface) return;

    let anchorObserver: IntersectionObserver | undefined;
    let boundaryObserver: IntersectionObserver | undefined;
    let previousHeaderHeight = -1;
    let previousControlsHeight = -1;
    let previousTrigger: Element | null = null;
    let triggerObserver: MutationObserver | undefined;
    let pastAnchor = false;
    let withinResults = true;
    const updateFloating = () => {
      const next = pastAnchor && withinResults;
      floatingRef.current = next;
      setFloating(next);
    };

    const measure = () => {
      const headerHeight = Math.ceil(
        header?.getBoundingClientRect().height ?? 0,
      );
      const controlsHeight = Math.ceil(surface.getBoundingClientRect().height);
      if (!triggerSelector && surface.dataset.floating !== "true")
        anchor.style.height = `${controlsHeight}px`;
      root.style.setProperty(
        "--archive-controls-height",
        `${controlsHeight}px`,
      );
      const sidebar = root.querySelector<HTMLElement>("[data-archive-sidebar]");
      const sidebarBounds = sidebar?.getBoundingClientRect();
      const controlsBounds = surface.getBoundingClientRect();
      const overlapsSidebar =
        surface.dataset.floating === "true" &&
        sidebarBounds &&
        sidebarBounds.width > 0 &&
        controlsBounds.left < sidebarBounds.right + 12 &&
        controlsBounds.right > sidebarBounds.left - 12;
      root.style.setProperty(
        "--archive-sidebar-gap",
        `${overlapsSidebar ? controlsHeight + 24 : 18}px`,
      );
      // Count the newsletter and footer instead of adding a full viewport of blank space.
      const tail = Math.max(
        0,
        document.documentElement.scrollHeight -
          (window.scrollY + root.getBoundingClientRect().bottom),
      );
      root.style.setProperty("--archive-tail-height", `${Math.floor(tail)}px`);

      const trigger = triggerSelector
        ? document.querySelector(triggerSelector)
        : anchor;
      if (!trigger) return;
      const layout = root.querySelector<HTMLElement>("[data-sidebar]");
      if (layout)
        root.style.setProperty(
          "--archive-results-offset",
          `${layout.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom}px`,
        );

      if (
        typeof IntersectionObserver === "undefined" ||
        (headerHeight === previousHeaderHeight &&
          controlsHeight === previousControlsHeight &&
          trigger === previousTrigger)
      )
        return;
      previousHeaderHeight = headerHeight;
      previousControlsHeight = controlsHeight;
      previousTrigger = trigger;
      anchorObserver?.disconnect();
      boundaryObserver?.disconnect();
      anchorObserver = new IntersectionObserver(
        ([entry]) => {
          pastAnchor =
            !entry.isIntersecting &&
            entry.boundingClientRect.bottom <= headerHeight;
          updateFloating();
        },
        { rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: 0 },
      );
      const boundary = headerHeight + controlsHeight + 24;
      boundaryObserver = new IntersectionObserver(
        ([entry]) => {
          withinResults = entry.boundingClientRect.bottom > boundary;
          updateFloating();
        },
        { rootMargin: `-${boundary}px 0px 0px 0px`, threshold: 0 },
      );
      anchorObserver.observe(trigger);
      boundaryObserver.observe(root);
    };

    measure();
    if (triggerSelector) {
      triggerObserver = new MutationObserver(measure);
      triggerObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
    const syncHeroQuery = (event: Event) => {
      if (!triggerSelector || !(event.target instanceof HTMLInputElement))
        return;
      const trigger = document.querySelector(triggerSelector);
      if (!trigger?.contains(event.target) || event.target.name !== "search")
        return;
      const field = surface.querySelector<HTMLInputElement>(
        'input[name="search"]',
      );
      if (field) field.value = event.target.value;
    };
    if (triggerSelector) document.addEventListener("input", syncHeroQuery);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    resizeObserver?.observe(surface);
    resizeObserver?.observe(document.body);
    if (header) resizeObserver?.observe(header);
    window.addEventListener("resize", measure);
    return () => {
      anchorObserver?.disconnect();
      boundaryObserver?.disconnect();
      resizeObserver?.disconnect();
      triggerObserver?.disconnect();
      document.removeEventListener("input", syncHeroQuery);
      window.removeEventListener("resize", measure);
    };
  }, [triggerSelector]);

  const navigate = (href: string) => {
    const anchor = triggerSelector
      ? document.querySelector(triggerSelector)
      : anchorRef.current;
    const headerHeight =
      document.querySelector(".site-header")?.getBoundingClientRect().height ??
      0;
    if (anchor) {
      const minimumTop =
        window.scrollY +
        anchor.getBoundingClientRect().bottom -
        headerHeight +
        12;
      const layout =
        rootRef.current?.querySelector<HTMLElement>("[data-sidebar]");
      const resultsTop = layout
        ? window.scrollY +
          layout.getBoundingClientRect().top -
          headerHeight -
          (controlsRef.current?.getBoundingClientRect().height ?? 0) -
          24
        : minimumTop;
      window.scrollTo({
        top: Math.max(0, minimumTop, resultsTop),
        behavior: "instant",
      });
    }
    router.push(href, { scroll: false });
  };

  const captureLink = (event: MouseEvent<HTMLDivElement>) => {
    if (
      !floatingRef.current ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !(event.target instanceof Element)
    )
      return;
    const link = event.target.closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== path) return;
    event.preventDefault();
    navigate(`${url.pathname}${url.search}`);
  };

  const captureSubmit = (event: FormEvent<HTMLDivElement>) => {
    if (!floatingRef.current || !(event.target instanceof HTMLFormElement))
      return;
    const form = event.target;
    if (!controlsRef.current?.contains(form)) return;
    event.preventDefault();
    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      if (typeof value !== "string") return;
      const text = key === "search" ? value.trim() : value;
      if (text && !(key === "sort" && text === "-published_at"))
        params.set(key, text);
    });
    const url = new URL(form.action);
    navigate(`${url.pathname}${params.size ? `?${params}` : ""}`);
  };

  return (
    <div
      ref={rootRef}
      className={styles.browser}
      data-archive-browser
      data-floating={floating}
      data-overlay-only={Boolean(triggerSelector)}
      onClickCapture={captureLink}
      onSubmitCapture={captureSubmit}
      onInputCapture={(event) => {
        if (
          !triggerSelector ||
          !(event.target instanceof HTMLInputElement) ||
          event.target.name !== "search"
        )
          return;
        const field = document
          .querySelector(triggerSelector)
          ?.querySelector<HTMLInputElement>('input[name="search"]');
        if (field) field.value = event.target.value;
      }}
    >
      <div
        ref={anchorRef}
        className={styles.controlsAnchor}
        data-archive-controls-anchor
      >
        <div
          ref={controlsRef}
          className={styles.browserControls}
          data-archive-filter-bar
          data-floating={floating}
        >
          <ArchiveFloatingContext.Provider value={floating}>
            {controls}
          </ArchiveFloatingContext.Provider>
        </div>
      </div>
      {children}
    </div>
  );
}
