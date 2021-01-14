import s from "./Ol.module.css";
type OlProps = {
  children: React.ReactNode;
};

export function Ol({ children }: OlProps) {
  return <ol className={s.ol}>{children}</ol>;
}
