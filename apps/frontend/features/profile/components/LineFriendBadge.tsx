"use client";

import { useTranslations } from "next-intl";
import type { ProfileResponse } from "@/lib/auth/types";

/**
 * Shows the user's LINE Official Account friend status. Only rendered for
 * accounts that signed in through LINE (a `lineSub` is present). The status
 * itself comes from the `line:friend` claim, which renkei keeps fresh via the
 * Messaging API webhook, so it reflects follows/unfollows that happen after
 * the first login too.
 */
export default function LineFriendBadge({
  profile,
}: {
  profile: ProfileResponse;
}) {
  const t = useTranslations("Profile.details");

  if (!profile.lineSub) return null;

  const isFriend = profile.lineFriend === true;
  const unknown =
    profile.lineFriend === null || profile.lineFriend === undefined;

  return (
    <div className="mt-4 border-t border-[var(--color-secondary)] pt-3">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[var(--color-text)]">
          {t("lineFriendLabel")}:
        </span>
        <span
          className={
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-medium " +
            (isFriend
              ? "bg-[#06C755]/15 text-[#06C755]"
              : "bg-[var(--color-secondary)] text-[var(--color-text)] opacity-70")
          }
        >
          <span
            aria-hidden="true"
            className={
              "h-2 w-2 rounded-full " +
              (isFriend ? "bg-[#06C755]" : "bg-current")
            }
          />
          {unknown
            ? t("lineFriendUnknown")
            : isFriend
              ? t("lineFriendYes")
              : t("lineFriendNo")}
        </span>
      </div>
    </div>
  );
}
