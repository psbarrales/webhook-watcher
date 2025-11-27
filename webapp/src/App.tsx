import { composeProviders } from '@providers/composeProvider';
import { WithBooting } from '@providers/withBooting';
import { AuthProvider } from '@providers/AuthProvider';
import { RouterProvider } from 'react-router-dom';
import router from '@routes/index';
import React, { ReactNode } from 'react';

const WithAuthorization = (children: ReactNode) => {
    const Providers = React.useMemo(
        () => composeProviders(AuthProvider),
        []
    );

    return <Providers>{children}</Providers>;
};

const App: React.FC = React.memo(() => WithBooting(
    WithAuthorization(
        <RouterProvider router={router} />
    )
));

export default App;
