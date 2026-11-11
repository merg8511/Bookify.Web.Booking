"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

import { BookifyLogo } from "@/components/brand/bookify-logo";
import { ContentContainer } from "@/components/ui/content-container";

import styles from "./public-header.module.css";

type MenuState = {
  pathname: string;
  open: boolean;
};

/*
 * BOOKIFY — NAV-P1 EDITORIAL HEADER
 *
 * NAV-001: navegación pública.
 * RESP-001: continuidad editorial responsive.
 * LOGO-004: zona de protección Horizon.
 *
 * No incorpora rutas o acciones de reserva
 * que todavía no existen.
 */
export function PublicHeader() {
  const pathname = usePathname() ?? "/";
  const mobileMenuId = useId();

  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const [menuState, setMenuState] = useState<MenuState>({
    pathname,
    open: false,
  });

  // Si la ruta cambia, el menú queda cerrado
  // incluso al navegar con Back/Forward.
  const isOpen = menuState.pathname === pathname && menuState.open;

  const isHome = pathname === "/";

  function closeMenu() {
    setMenuState({
      pathname,
      open: false,
    });
  }

  function toggleMenu() {
    setMenuState({
      pathname,
      open: !isOpen,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape" || !isOpen) {
      return;
    }

    event.preventDefault();

    closeMenu();

    // Restituir el foco al control que abrió el menú.
    menuButtonRef.current?.focus();
  }

  // Como el menú es un disclosure no modal,
  // cerrar al interactuar fuera del encabezado
  // sin bloquear el scroll ni el resto de la página.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleOutsidePointer(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        headerRef.current &&
        !headerRef.current.contains(target)
      ) {
        setMenuState({
          pathname,
          open: false,
        });
      }
    }

    document.addEventListener("pointerdown", handleOutsidePointer);

    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointer);
    };
  }, [isOpen, pathname]);

  return (
    <header ref={headerRef} className={styles.header} onKeyDown={handleKeyDown}>
      <a href="#contenido-principal" className={styles.skipLink}>
        Saltar al contenido principal
      </a>

      <ContentContainer>
        <div className={styles.bar}>
          <BookifyLogo context="public" href="/" className={styles.brand} />

          <nav aria-label="Navegación principal" className={styles.desktopNav}>
            <Link
              href="/"
              className={styles.navLink}
              aria-current={isHome ? "page" : undefined}
            >
              Inicio
            </Link>
          </nav>

          <Link href="/login" className={styles.staffLink}>
            Acceso del equipo
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            className={styles.menuButton}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-controls={mobileMenuId}
            aria-expanded={isOpen}
            onClick={toggleMenu}
          >
            {isOpen ? (
              <XIcon size={22} weight="regular" aria-hidden="true" />
            ) : (
              <ListIcon size={22} weight="regular" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav
          id={mobileMenuId}
          aria-label="Navegación móvil"
          className={styles.mobileNav}
          hidden={!isOpen}
        >
          <Link
            href="/"
            className={styles.mobileLink}
            aria-current={isHome ? "page" : undefined}
            onClick={closeMenu}
          >
            Inicio
          </Link>

          <Link href="/login" className={styles.mobileLink} onClick={closeMenu}>
            Acceso del equipo
          </Link>
        </nav>
      </ContentContainer>
    </header>
  );
}
