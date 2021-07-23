import * as React from "react";
import { CopyButton } from "@lib/components/CopyButton";
import s from "./CopiableExample.module.scss";

export function CopiableExample({ cnt }: { cnt: string }) {
  return (
    <pre className={s.pre}>
      <span>{cnt}</span>
      <span className={s.copyBtn}>
        <CopyButton provideContent={() => cnt} />
      </span>
    </pre>
  );
}
