import { z } from 'zod';
export declare const createPhotoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodString;
    isFeatured: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean]>>>;
    isVisible: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean]>>>;
    orderIndex: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    categoryId: string;
    isFeatured: boolean;
    orderIndex: string;
    isVisible: boolean;
    title?: string | undefined;
    description?: string | undefined;
}, {
    categoryId: string;
    title?: string | undefined;
    isFeatured?: string | boolean | undefined;
    description?: string | undefined;
    orderIndex?: string | undefined;
    isVisible?: string | boolean | undefined;
}>;
export declare const updatePhotoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodString>;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    isFeatured: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean]>>;
    isVisible: z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean]>>;
    orderIndex: z.ZodOptional<z.ZodString>;
    takenAt: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    exifData: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    categoryId?: string | undefined;
    isFeatured?: boolean | undefined;
    description?: string | undefined;
    takenAt?: string | undefined;
    orderIndex?: string | undefined;
    imageUrl?: string | undefined;
    thumbnailUrl?: string | undefined;
    isVisible?: boolean | undefined;
    exifData?: any;
}, {
    title?: string | undefined;
    categoryId?: string | undefined;
    isFeatured?: string | boolean | undefined;
    description?: string | undefined;
    takenAt?: string | undefined;
    orderIndex?: string | undefined;
    imageUrl?: string | undefined;
    thumbnailUrl?: string | undefined;
    isVisible?: string | boolean | undefined;
    exifData?: any;
}>;
export declare const bulkUploadPhotosSchema: z.ZodObject<{
    categoryId: z.ZodString;
    isFeatured: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean]>>>;
    isVisible: z.ZodDefault<z.ZodOptional<z.ZodUnion<[z.ZodEffects<z.ZodString, boolean, string>, z.ZodBoolean]>>>;
}, "strip", z.ZodTypeAny, {
    categoryId: string;
    isFeatured: boolean;
    isVisible: boolean;
}, {
    categoryId: string;
    isFeatured?: string | boolean | undefined;
    isVisible?: string | boolean | undefined;
}>;
export declare const photoIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const updatePhotosOrderSchema: z.ZodObject<{
    photos: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        orderIndex: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: number;
        orderIndex: number;
    }, {
        id: number;
        orderIndex: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    photos: {
        id: number;
        orderIndex: number;
    }[];
}, {
    photos: {
        id: number;
        orderIndex: number;
    }[];
}>;
export declare const getPhotosSchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    isFeatured: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    page: string;
    limit: string;
    categoryId?: string | undefined;
    isFeatured?: boolean | undefined;
}, {
    categoryId?: string | undefined;
    isFeatured?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
}>;
//# sourceMappingURL=photoValidation.d.ts.map