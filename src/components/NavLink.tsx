import { children, type JSX, splitProps } from "solid-js";
import { isActive, isPending } from "~/lib/router.tsx";

export interface NavLinkProps extends Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "class"> {
    href: string;
    class?:
        | ((
            state: { readonly isActive: boolean; readonly isPending: boolean },
        ) => string | undefined)
        | string;
}

export function NavLink(props: NavLinkProps) {
    const [_, rest] = splitProps(props, ["children", "class"]);
    const resolved = children(() => props.children);
    const state = {
        get isActive() {
            return isActive(props.href);
        },
        get isPending() {
            return isPending(props.href);
        },
    };

    return (
        <a class={typeof props.class === "function" ? props.class(state) : props.class} {...rest}>
            {resolved()}
        </a>
    );
}
