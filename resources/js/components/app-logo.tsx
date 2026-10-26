export default function AppLogo() {
    return (
        <>
            <img src="/img/logo.png" alt="" className="size-9 shrink-0 object-contain" />
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="font-display truncate text-base leading-tight font-semibold">
                    KBeauty Glow
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-sidebar-primary uppercase">
                    Administración
                </span>
            </div>
        </>
    );
}
