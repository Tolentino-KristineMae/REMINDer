import React, { createContext, useState } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [showAddBillModal, setShowAddBillModal] = useState(false);

    const openAddBillModal = () => setShowAddBillModal(true);
    const closeAddBillModal = () => setShowAddBillModal(false);

    return (
        <ModalContext.Provider value={{ showAddBillModal, openAddBillModal, closeAddBillModal }}>
            {children}
        </ModalContext.Provider>
    );
};
