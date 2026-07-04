import { NextResponse } from "next/server";

export async function GET(){
    const url = "https://openrouter.ai/api/v1/models";
    const options = {
      method: "GET",
      headers: { Authorization: process.env.OPENROUTER_API_KEY },
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      // console.log(data);

      if (!response.ok) {
        throw new Error("There was an error fetching data !");
        // return NextResponse.json(
        //   { error: "There was an error, fetching data" },
        //   { status: 400 },
        // );
      }

      const freeModels = data.data.filter((model) => {
        // const model_ids = ['bytedance-seed/seed-2.0-lite', 'nvidia/nemotron-3-super-120b-a12b:free']
        const promptPrice = parseFloat(model.pricing?.prompt || "0");
        const completionPrice = parseFloat(model.pricing?.completion || "0");
        return promptPrice === 0 && completionPrice === 0;
        // return model.id = "bytedance-seed/seed-2.0-lite"
      });

      // Return formatted response with useful model information
      const formattedModels = freeModels.map((model) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        context_length: model.context_length,
        architecture: model.architecture,
        pricing: model.pricing,
        top_provider: model.top_provider,
      }));

      // console.log(formattedModels)

      return NextResponse.json({
        models: formattedModels,
      });
    } catch (error) {
      //   console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
