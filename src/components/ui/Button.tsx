import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { buttonClassNames, type ButtonStyleProps } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonStyleProps['variant']
  size?: ButtonStyleProps['size']
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'default', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClassNames({ variant, size, className })}
      {...props}
    />
  )
})
