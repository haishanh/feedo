import * as React from "react";
import { CopyButton } from "@lib/components/CopyButton";
import s from "./CopiableExample.module.scss";

export function CopiableExample({ cnt }: { cnt: string }) {
  return (
    <div className={s.CopiableExample}>
      <pre className={s.pre}>
        <code>{cnt}</code>
      </pre>
      <span className={s.copyBtn}>
        <CopyButton provideContent={() => cnt} />
      </span>
    </div>
  );
}
