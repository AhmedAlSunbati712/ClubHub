// Reusable button. variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button type={type} className={`btn btn-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
