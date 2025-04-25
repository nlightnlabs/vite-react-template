

const modules = [
    {
        id: 1, 
        name: "module_1",
        title: "module_1.title",
        subtitle: "module_1.subtitle",
        section: "module_1.section",
        description: "module_1.description",
        icon_name: "AppIcon",
        link: "module_1"
    },
    {
      id: 2, 
      name: "module_2",
      title: "module_2.title",
      subtitle: "module_2.subtitle",
      section: "module_2.section",
      description: "module_2.description",
      icon_name: "AppIcon",
      link: "module_2"
    },
    {
      id: 3, 
      name: "module_3",
      title: "module_3.title",
      subtitle: "module_3.subtitle",
      section: "module_3.section",
      description: "module_3.description",
      icon_name: "AppIcon",
      link: "module_3"
    },
    {
      id: 4, 
      name: "labs",
      title: "labs.title",
      subtitle: "labs.subtitle",
      section: "labs.section",
      description: "labs.description",
      icon_name: "LabsIcon",
      link: "labs"
    }
  ]

const sideMenuItems = modules


const themes = [
  {id: 1, name: "root", label: "Default", ag_grid: "ag-theme-alpine"},
  {id: 2, name: "dark", label: "Dark", ag_grid: "ag-theme-alpine-dark"},
  {id: 3, name: "light", label: "Light", ag_grid: "ag-theme-balham"},
  {id: 4, name: "darkblue", label: "Dark Blue", ag_grid: "ag-theme-material"},
  {id: 5, name: "purple", label: "Purple", ag_grid: "ag-theme-quartz"}
]

const languages = [
    { id: 1, code: "en", name: "english", label: "English"},
    { id: 2, code: "es", name: "spanish", label: "Spanish"},
    { id: 3, code: "fr", name: "french", label: "French"},
    { id: 4, code: "de", name: "german", label: "German"},
    { id: 5, code: "it", name: "italian", label: "Italian"},
    { id: 6, code: "nl", name: "dutch", label: "Dutch"},
    { id: 7, code: "pt", name: "portuguese", label: "Portuguese"}
];


const dbName = "dealprep"
export const s3Bucket = "nlightnlabs01"
export const images = "https://nlightnlabs01.s3.us-west-1.amazonaws.com/icons/images"
export const icons = "https://nlightnlabs01.s3.us-west-1.amazonaws.com/icons/icons"
export const s3url = "https://nlightnlabs01.s3.us-west-1.amazonaws.com/"
export const s3RootFolder = "dealprep"


export const config = {
    appName: "nlightn",
    creator: "Avik Ghosh",
    theme: "root",
    logo: "ImageIcon",
    language: "en",
    currentPage: "home",
    currentModule: modules[0],
    currentView: null,
    currentPath: "/",
    modules: modules,
    themes: themes,
    languages: languages,
    sideMenuItems: sideMenuItems, 
    dbName: dbName,
    s3url: s3url,
    s3Bucket: s3Bucket,
    images: images,
    icons: icons
}