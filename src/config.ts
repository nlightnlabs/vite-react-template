

const modules = [
    {
        id: 1, 
        name: "module_1",
        title: "Module 1", 
        section: "Main",
        subtitle: "Subtitle 1", 
        description: `This is a detailed description of the Module 1 such as its purpose,
                      how it works, and how it delivers value to the user.`,
        icon_name: "ImageIcon",
        link: "module_1"
    },
    {
      id: 2, 
      name: "module_2",
      section: "Main",
      title: "Module 2", 
      subtitle: "Subtitle 2", 
      description: `This is a detailed description of the Module 2 such as its purpose,
                    how it works, and how it delivers value to the user.`,
      icon_name: "ImageIcon",
      link: "module_2"
    },
    {
      id: 3, 
      section: "Admin",
      name: "module_3",
      title: "Module 3", 
      subtitle: "Subtitle 3", 
      description: `This is a detailed description of the Module 3 such as its purpose,
                    how it works, and how it delivers value to the user.`,
      icon_name: "ImageIcon",
      link: "module_3"
    },
    {
      id: 4, 
      name: "labs",
      title: "Labs", 
      section: "Admin",
      subtitle: "Labs", 
      description: `Experimental apps for R&D purposes`,
      icon_name: "ImageIcon",
      link: "labs"
    }
  ]

const sideMenuItems = modules.map((item:any)=>(
  {id: item.id, section:item.section, label: item.title, icon_name: item.icon_name, link: item.link}
))


const themes = [
  {id: 1, name: "root", label: "Default"},
  {id: 2, name: "dark", label: "Dark"},
  {id: 3, name: "light", label: "Light"},
  {id: 4, name: "darkblue", label: "Dark Blue"},
  {id: 5, name: "purple", label: "Purple"}
]


const dbName = "dealprep"
export const s3Bucket = "nlightnlabs01"
export const images = "https://nlightnlabs01.s3.us-west-1.amazonaws.com/icons/images"
export const icons = "https://nlightnlabs01.s3.us-west-1.amazonaws.com/icons/icons"
export const s3url = "https://nlightnlabs01.s3.us-west-1.amazonaws.com/"
export const s3RootFolder = "dealprep"


export const config = {
    appName: "dealPrep",
    creator: "Avik Ghosh",
    theme: "root",
    logo: "ImageIcon",
    currentPage: "home",
    currentModule: modules[0],
    currentView: null,
    currentPath: "/",
    modules: modules,
    themes: themes,
    sideMenuItems: sideMenuItems, 
    dbName: dbName,
    s3url: s3url,
    s3Bucket: s3Bucket,
    images: images,
    icons: icons
}