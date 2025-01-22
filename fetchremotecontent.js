/*
** Contains the functionality for importing external content to create remote plugin content objects
** Takes parameters author, repo, and branch to visit github API and grab the tree of a repo
*/

export function fetchRemoteContentConfig(author, repo, branch) {

    // https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repoId}/items?scopePath=/&versionDescriptor.version={branch}&api-version=6.0
    return fetch(`https://api.github.com/repos/${author}/${repo}/git/trees/${branch}?recursive=1`, {
      headers: {
        Authorization: "your PAT token",
      },
    })
      .then((resp) => {
        return resp.json()
      })
      .then((resp) => {
        // Initialize array for remote content plugin
        const config = []
  
        // Returning all paths that start with docs/
        const docs = resp.tree.filter((doc) => {
          if (doc.path.startsWith("docs/")) {
            return true
          }
        })
  
        // Return all docs of tree type/directory
        const folders = docs.filter((doc) => {
          return doc.type === "tree"
        })
  
        // Loop through each folder and create docusaurus plugin remote content array object
        folders.forEach((folder) => {
          const folderName = folder.path.replace("docs/", "")

          // A decision is made here based on whether the folder is an images folder or not
          // If not images folder (aka .md/.mdx files)
          if(!folderName.includes('/img')){
            // Push the array containing an object to the final returned config array
            config.push([
              "docusaurus-plugin-remote-content",
              {
                name: `${folderName}_docs`, // used by CLI, must be path safe
                sourceBaseUrl: `https://raw.githubusercontent.com/${author}/${repo}/${branch}/docs/${folderName}`, // the base url for the markdown (gets prepended to all of the documents when fetching)
                outDir: `docs/${folderName}`, // the base directory to output to.
                // This is essentially logic to determine all the files/documents at that directory level that should be grabbed
                documents: docs
                  .filter((doc) => {
                    const relativePath = doc.path.replace(`docs/${folderName}/`, "");
                    return (
                      // Filter for docs only in the directory being worked on (example filter for docs in tutorial basics directory level, or filter for docs in sub directory test-subfolder)
                      doc.type === "blob" &&
                      doc.path.startsWith(`docs/${folderName}`) &&
                      !relativePath.includes("/") && // Exclude nested files in subfolders
                      !decodeURIComponent(relativePath).includes("/") &&// Handle URL-encoded paths
                      (doc.path.endsWith(".md") || doc.path.endsWith(".mdx") || doc.path.endsWith(".json"))
                    )
                  })
                  .map((doc) => {
                    return encodeURIComponent(doc.path.replace(`docs/${folderName}/`, ""))
                  }),
                  requestConfig: { responseType: "text" },

              },
            ])
          }
  
  
  
          // If folderName is img we are going to work on it like we are importing images with the plugin
          else{
            config.push([
              "docusaurus-plugin-remote-content",
              {
                name: `${folderName}_imgs`, // used by CLI, must be path safe
                sourceBaseUrl: `https://raw.githubusercontent.com/${author}/${repo}/${branch}/docs/${folderName}`, // the base url for the markdown (gets prepended to all of the documents when fetching)
                outDir: `docs/${folderName}`, // the base directory to output to.
                documents: docs
                  .filter((doc) => {
                    console.log
                    const relativePath = doc.path.replace(`docs/${folderName}/`, "");
                    return (
                      // Filter for docs only in the directory being worked on (example filter for docs in tutorial basics directory level, or filter for docs in sub directory test-subfolder)
                      doc.type === "blob" &&
                      doc.path.startsWith(`docs/${folderName}`) &&
                      !relativePath.includes("/") && // Exclude nested files in subfolders
                      !decodeURIComponent(relativePath).includes("/") &&// Handle URL-encoded paths
                      (doc.path.endsWith(".png") || doc.path.endsWith(".gif"))
                    )
                  })
                  .map((doc) => {
                    return encodeURIComponent(doc.path.replace(`docs/${folderName}/`, ""))
                  }),
                  requestConfig: { responseType: "arraybuffer"}
              }
              
              
            ])
          }
  
  
          
        })
  
  
        return config
      })
      .catch((err) => {
        console.log(err)
      })
  }