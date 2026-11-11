import type { InputHTMLAttributes } from "react";
import styles from "./text-field.module.css";

type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "children"
> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({
  id,
  label,
  hint,
  error,
  required = false,
  className = "",
  ...inputProps
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const describedBy =
    [inputProps["aria-describedby"], hintId, errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  const inputClasses = [styles.input, error ? styles.invalid : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required && <span className={styles.required}> (obligatorio)</span>}
      </label>

      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}

      <input
        {...inputProps}
        id={id}
        required={required}
        className={inputClasses}
        aria-invalid={error ? true : inputProps["aria-invalid"]}
        aria-describedby={describedBy}
      />

      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
