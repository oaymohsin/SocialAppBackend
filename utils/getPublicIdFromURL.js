//images,videos ka cloudinary url db mn store hai jb k user image ya file ko update
// krta hai to phly vali files ko cloudinary sy delete krvana hai 


export const getPublicId = (url) => {
  const splittedURL = url.split("/");

  const publicIdWithExtension =
    splittedURL[splittedURL.length - 1].split(".")[0];
  return publicIdWithExtension;
};
