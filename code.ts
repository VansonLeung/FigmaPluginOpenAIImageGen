// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {
  title: "OpenAI Image Gen",
  width: 500,
  height: 400,
});

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = msg => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'cancel') {
    
    figma.closePlugin();

  } else if (msg.type === 'create-rectangles') {

    console.log('calling api');
    callApi({
      prompt: msg.prompt,
      numImages: msg.count,
      size: msg.size,
    })
    .then((res) => {
      console.log(res);

      const runCreateImageAsync = (index) => {
        var data = res[index];
        var url = data.url;

        figma.createImageAsync(
          url
        ).then(async (image: Image) => {
          // Create node
          const node = figma.createRectangle()
  
          // Resize the node to match the image's width and height
          const { width, height } = await image.getSizeAsync()
          node.resize(width, height)
          node.x = msg.size * index;
          node.y = msg.size * msg.yIndex;
  
          // Set the fill on the node
          node.fills = [
            {
              type: 'IMAGE',
              imageHash: image.hash,
              scaleMode: 'FILL'
            }
          ]
  
        }).catch((error: any) => {
          console.log(error)
        })  
      }
      
      for (var k = 0; k < res.length; k += 1) {
        runCreateImageAsync(k);
      }



    })
    .catch((e) => {
      console.log(e)
    })

  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  // figma.closePlugin();
};



async function callApi({
  prompt,
  numImages,
  size,
}): Promise<any> {
  const url = 'https://api.openai.com/v1/images/generations';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer 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`,
  };
  const body = JSON.stringify({
    prompt,
    // model,
    n: numImages,
    // response_format: responseFormat,
    size: `${size}x${size}`,
  });
  console.log("B", body);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });
    console.log("C", response)
    const data = await response.json();
    console.log("D", data)
    if (response.ok) {
      return data.data;
    } else {
      console.error(data.error);
      throw new Error(data.error.message);
    }
  } catch (e) {
    console.error("x", e);
  }
  console.log("EW", body);
}