
import { ConvexError } from 'convex/values';
import { useState } from 'react';

// Type definitions for error handling
type ErrorMessage = string[];
type ConvexError = {
    data: {
        [key: string]: { _errors: string[]; };
    };
};

export function useZodErrorHandler() {
    const [errors, setErrors] = useState<ErrorMessage>([]);

    const handleError = (error: unknown) => {
        if (error instanceof ConvexError) {
            const zodError = error.data;
            const errorMessages = Object.entries(zodError);

            const flattenedErrors = errorMessages.reduce((acc: string[], [field, messages]) => {
                if (messages?._errors?.length) {
                    acc.push(`${field}: ${messages._errors.join(', ')}`);
                }
                return acc;
            }, []);

            setErrors(flattenedErrors);
            console.log(JSON.stringify(flattenedErrors, null, 2));
            setTimeout(() => setErrors([]), 10000);
        }
    };

    const clearErrors = () => {
        setErrors([]);
    };

    return { errors, handleError, clearErrors };
};
