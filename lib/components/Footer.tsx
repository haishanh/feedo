import { GitHub } from "react-feather";
import VisuallyHidden from "@reach/visually-hidden";
import s from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={s.footer}>
      <a href="https://github.com/haishanh/feedo">
        <GitHub size={15} />
        <VisuallyHidden>Source code on GitHub</VisuallyHidden>
      </a>
      <div className={s.text}>
        <span>Made in Shanghai</span>
      </div>
    </footer>
  );
}
