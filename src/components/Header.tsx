"use client";

import React from 'react';
import { signIn, signOut, useSession } from "next-auth/react";
import styles from './Header.module.css';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon} />
        QuickSync
      </div>
      <div className={styles.actions}>
        {session ? (
          <>
            <img src={session.user?.image || ""} alt="" className={styles.avatar} />
            <span className={styles.userName}>{session.user?.name}</span>
            <button onClick={() => signOut()} className={styles.todayButton}>Sign Out</button>
          </>
        ) : (
          <button onClick={() => signIn("google")} className={styles.todayButton}>Sign In with Google</button>
        )}
      </div>
    </header>
  );
}
