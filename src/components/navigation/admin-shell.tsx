"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  IconLayoutDashboard,
  IconMenu2,
  IconX,
  IconUserCircle,
  IconWorld,
} from "@tabler/icons-react";

import { BookifyLogo } from "@/components/brand/bookify-logo";

import styles from "./admin-shell.module.css";

type AdminShellProps = {
  children: ReactNode;
};

type NavigationProps = {
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
};

function AdminNavigation({
  pathname,
  mobile = false,
  onNavigate,
}: NavigationProps) {
  return (
    <nav
      aria-label={
        mobile ? "Navegación administrativa móvil" : "Navegación administrativa"
      }
      className={styles.navigation}
    >
      <p className={styles.navigationCaption}>ESPACIO DE TRABAJO</p>

      <Link
        href="/admin"
        className={styles.navigationLink}
        aria-current={pathname === "/admin" ? "page" : undefined}
        onClick={onNavigate}
      >
        <IconLayoutDashboard size={20} stroke={1.8} aria-hidden="true" />
        <span>Panel</span>
      </Link>
    </nav>
  );
}

function SidebarContent({
  pathname,
  mobile = false,
  onNavigate,
}: NavigationProps) {
  return (
    <div className={styles.sidebarInner}>
      <div className={styles.brandArea}>
        <BookifyLogo
          context="admin"
          href={mobile ? undefined : "/admin"}
          className={styles.sidebarBrand}
        />

        <span className={styles.brandCaption}>ADMINISTRACIÓN</span>
      </div>

      <AdminNavigation
        pathname={pathname}
        mobile={mobile}
        onNavigate={onNavigate}
      />

      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.externalLink} onClick={onNavigate}>
          <IconWorld size={20} stroke={1.8} aria-hidden="true" />
          <span>Sitio público</span>
        </Link>
      </div>
    </div>
  );
}

/*
 * BOOKIFY — NAV-A1
 *
 * Sidebar + Topbar:
 * - una sola identidad A2;
 * - navegación únicamente a rutas existentes;
 * - dialog nativo para foco modal en móvil;
 * - sin información de sesión en el cliente.
 *
 * La autorización ocurre en admin/layout.tsx
 * y se conserva también en admin/page.tsx.
 */
export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname() ?? "/admin";

  const [openOnPath, setOpenOnPath] = useState<string | null>(null);

  const isOpen = openOnPath === pathname;

  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  function closeDrawer() {
    setOpenOnPath(null);
  }

  function openDrawer() {
    setOpenOnPath(pathname);
  }

  /*
   * showModal activa el manejo modal nativo:
   * foco dentro del dialog y fondo inerte.
   */
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  /*
   * No permitir que un dialog abierto
   * permanezca modal al cambiar a escritorio.
   */
  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia("(min-width: 901px)");

    function handleViewportChange() {
      if (media.matches) {
        setOpenOnPath(null);
      }
    }

    media.addEventListener("change", handleViewportChange);

    return () => {
      media.removeEventListener("change", handleViewportChange);
    };
  }, []);

  return (
    <div className={styles.shell}>
      <a href="#contenido-administrativo" className={styles.skipLink}>
        Saltar al contenido principal
      </a>

      <aside
        className={styles.desktopSidebar}
        aria-label="Barra lateral administrativa"
      >
        <SidebarContent pathname={pathname} />
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <a href="#contenido-administrativo" className={styles.skipLink}>
            Saltar al contenido principal
          </a>

          <div className={styles.topbarStart}>
            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              aria-label="Abrir menú administrativo"
              aria-controls="bookify-admin-drawer"
              aria-expanded={isOpen}
              onClick={openDrawer}
            >
              <IconMenu2 size={22} stroke={1.8} aria-hidden="true" />
            </button>

            <BookifyLogo
              context="admin"
              href="/admin"
              className={styles.mobileBrand}
            />

            <div className={styles.topbarContext}>
              <span className={styles.contextCaption}>BOOKIFY</span>

              <span className={styles.contextTitle}>Administración</span>
            </div>
          </div>

          <Link href="/account" className={styles.accountLink}>
            <IconUserCircle size={20} stroke={1.8} aria-hidden="true" />
            <span>Mi cuenta</span>
          </Link>
        </header>

        <main
          id="contenido-administrativo"
          tabIndex={-1}
          className={styles.main}
        >
          {children}
        </main>
      </div>

      <dialog
        id="bookify-admin-drawer"
        ref={dialogRef}
        className={styles.mobileDialog}
        aria-label="Menú administrativo"
        onCancel={(event) => {
          event.preventDefault();
          closeDrawer();
        }}
        onClose={() => {
          setOpenOnPath(null);
          menuButtonRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeDrawer();
          }
        }}
      >
        <div className={styles.mobilePanel}>
          <div className={styles.mobilePanelHeader}>
            <span>Menú</span>

            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Cerrar menú administrativo"
              className={styles.closeButton}
              onClick={closeDrawer}
            >
              <IconX size={22} stroke={1.8} aria-hidden="true" />
            </button>
          </div>

          <SidebarContent pathname={pathname} mobile onNavigate={closeDrawer} />
        </div>
      </dialog>
    </div>
  );
}
