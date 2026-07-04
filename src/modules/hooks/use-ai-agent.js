import {useQuery} from "@tanstack/react-query";


export const useAIModels = ()=>{
    const { data, isPending } = useQuery({
      queryKey: ["ai-models"],
      queryFn: () => fetch("/api/ai/get-models").then((res) => res.json()),
    });
    return { data, isPending };
}   