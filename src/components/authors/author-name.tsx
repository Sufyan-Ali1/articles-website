import Link from "next/link";
import type { AuthorResponse } from "@/types/api";
import { editorialTeam, isEditorialTeam } from "@/lib/content/editorial-team";

export function AuthorName({ author }: { author: AuthorResponse }) {
  return isEditorialTeam(author) ? (
    <Link href={editorialTeam.path} rel="author">
      {editorialTeam.name}
    </Link>
  ) : (
    <>{author.name}</>
  );
}
