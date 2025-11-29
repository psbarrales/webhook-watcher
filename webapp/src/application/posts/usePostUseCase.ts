import { IPost } from "@domain/models/entities/IPost";
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useRef } from "react";

// Tipo para cliente de posts
interface PostClient {
    fetchPosts: () => Promise<Array<IPost>>;
}

export const usePostUseCase = (postClient: PostClient) => {
    // Estado interno del caso de uso
    const [postCount, setPostCount] = useState<number>(0);

    // Referencia para almacenar los datos de posts y evitar llamar hooks dentro de callbacks
    const postsRef = useRef<Array<IPost> | undefined>(undefined);

    const usePosts = () => {
        const {
            status,
            data: rawData,
            error,
            isFetching,
        } = useQuery({
            queryKey: ["posts"],
            queryFn: async () => {
                const posts = await postClient.fetchPosts();

                // Actualizar el contador de posts en el estado del caso de uso
                setPostCount(posts.length);

                const transformedPosts = posts.map((post) => ({
                    ...post,
                    title: post.title.toUpperCase(),
                }));

                // Update the reference with the latest data
                postsRef.current = transformedPosts;

                return transformedPosts;
            },
        });

        // Mantener la referencia actualizada cuando los datos cambian
        if (rawData && postsRef.current !== rawData) {
            postsRef.current = rawData;
        }

        return {
            status,
            data: rawData,
            error,
            isFetching,
        };
    };

    // Method to filter posts by title (using the reference)
    const filterPostsByTitle = useCallback((searchTerm: string) => {
        // Usar postsRef en lugar de llamar usePosts()
        const posts = postsRef.current;

        if (!posts) return [];

        return posts.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, []);

    // Method to get the posts counter
    const getPostCount = useCallback(() => {
        return postCount;
    }, [postCount]);

    // Expose all required methods and state
    return {
        usePosts,
        filterPostsByTitle,
        getPostCount,
    };
};
