"use client";
import { Toaster } from "react-hot-toast";

const ToasterContext = () => {
  return (
    <div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20,
          left: 20,
          bottom: 20,
          right: 20,
        }}
        toastOptions={{
          // Default options for all toasts
          className: '',
          duration: 4000,
          style: {
            background: '#F7F3EB',
            color: '#2D3142',
            border: '1px solid #D5C4B7',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(45, 49, 66, 0.1), 0 2px 4px rgba(45, 49, 66, 0.06)',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            direction: 'rtl',
            textAlign: 'right',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maxWidth: '400px',
            minWidth: '280px',
          },
          // Success toasts
          success: {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #F7F3EB 0%, #E8F5E8 100%)',
              color: '#2D3142',
              border: '1px solid #8E9A7C',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(142, 154, 124, 0.2), 0 2px 6px rgba(142, 154, 124, 0.1)',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '500',
              direction: 'rtl',
              textAlign: 'right',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            },
            iconTheme: {
              primary: '#8E9A7C',
              secondary: '#F7F3EB',
            },
          },
          // Error toasts
          error: {
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #F7F3EB 0%, #FDF2F2 100%)',
              color: '#2D3142',
              border: '1px solid #E57373',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(229, 115, 115, 0.2), 0 2px 6px rgba(229, 115, 115, 0.1)',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '500',
              direction: 'rtl',
              textAlign: 'right',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            },
            iconTheme: {
              primary: '#E57373',
              secondary: '#F7F3EB',
            },
          },
          // Loading toasts
          loading: {
            duration: Infinity,
            style: {
              background: 'linear-gradient(135deg, #F7F3EB 0%, #E8E4F3 100%)',
              color: '#2D3142',
              border: '1px solid #B8A99C',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(184, 169, 156, 0.2), 0 2px 6px rgba(184, 169, 156, 0.1)',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '500',
              direction: 'rtl',
              textAlign: 'right',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            },
            iconTheme: {
              primary: '#B8A99C',
              secondary: '#F7F3EB',
            },
          },
        }}
      />
    </div>
  );
};

export default ToasterContext;
