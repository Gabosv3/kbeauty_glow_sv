import { useEffect } from 'react';

/** Si la URL trae ?new=1 (viene del menú "Crear"), abre el formulario de alta y limpia el parámetro. */
export function useOpenOnNew(open: () => void): void {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (params.get('new') !== '1') {
            return;
        }

        params.delete('new');

        const query = params.toString();

        window.history.replaceState(window.history.state, '', window.location.pathname + (query ? `?${query}` : ''));
        open();
        // Solo al montar la página.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}
