import type {
  ForwardRefExoticComponent,
  RefAttributes,
  SVGProps,
} from "react"

type SocialLucideIcon = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, "ref"> & RefAttributes<SVGSVGElement>
>

declare module "lucide-react" {
  export const InstagramIcon: SocialLucideIcon
  export const FacebookIcon: SocialLucideIcon
  export const TwitterIcon: SocialLucideIcon
}
