# To-do list

* Adjust the scroll area of the content page
* Generating content by the explicited selected model on the block.
* Assistant:
  * Show assitants on the mention list.
  * Ask AI to select the choosing blocks strategy.
  * Generating content by the selected block.
* ToC

When the user types the key Enter and builds a new block under the block with `@model-name`, directly call the AI continue writing with the content above the new block and the model's provider and key.
Streamingly put the response in the new block.

When AI is generating, please, choose a color and use the color to highlight the part of context through the selected block ids.

When AI is generating, The editor does not allow the deletion and modification of those highlight blocks, but it is allow to insert a new block between them.

After AI finishs the generation, cancel the highlight of the context and highlight the output. And automatically scroll to the response and ask if the user accept or cancel it. accept it, remove the highlight. cancel, remove the response.