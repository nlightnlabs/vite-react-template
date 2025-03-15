

const modules = [
    {
        id: 1, 
        name: "Module 1",
        title: "Module 1", 
        subtitle: "Subtitle 1", 
        description: `This is a detailed description of the Module 1 such as its purpose,
                      how it works, and how it delivers value to the user.`,
        icon_name: "ImageIcon",
        link: "module_1",
        views: [
          {id: 1, name: "view1", label:"View 1", icon: "", link: "view_1"},
          {id: 2, name: "view2", label:"View 2", icon: "",  link: "view_2"},
          {id: 3, name: "view3", label:"View 3", icon: "", link: "view_3"},
          {id: 4, name: "view4", label:"View 4", icon: "", link: "view_4"},
          {id: 5, name: "view5", label:"View 5", icon: "", link: "view_5"}
        ]
    },
    {
      id: 2, 
      name: "Module 2",
      title: "Module 2", 
      subtitle: "Subtitle 2", 
      description: `This is a detailed description of the Module 2 such as its purpose,
                    how it works, and how it delivers value to the user.`,
      icon_name: "ImageIcon",
      link: "module_2",
      views: [
        {id: 1, name: "view1", label:"View 1", icon: "", link: "view_1"},
        {id: 2, name: "view2", label:"View 2", icon: "",  link: "view_2"},
        {id: 3, name: "view3", label:"View 3", icon: "", link: "view_3"},
        {id: 4, name: "view4", label:"View 4", icon: "", link: "view_4"},
        {id: 5, name: "view5", label:"View 5", icon: "", link: "view_5"}
      ]
    },
    {
      id: 3, 
      name: "Module 3",
      title: "Module 3", 
      subtitle: "Subtitle 3", 
      description: `This is a detailed description of the Module 3 such as its purpose,
                    how it works, and how it delivers value to the user.`,
      icon_name: "ImageIcon",
      link: "module_3",
      views: [
        {id: 1, name: "view1", label:"View 1", icon: "", link: "view_1"},
        {id: 2, name: "view2", label:"View 2", icon: "",  link: "view_2"},
        {id: 3, name: "view3", label:"View 3", icon: "", link: "view_3"},
        {id: 4, name: "view4", label:"View 4", icon: "", link: "view_4"},
        {id: 5, name: "view5", label:"View 5", icon: "", link: "view_5"}
      ]
    }
  ]

const sideMenuItems = modules.map((item:any)=>(
  {id: item.id, section:"", label: item.title, icon_name: item.icon_name, link: item.link}
))


export const config = {
    appName: "appName",
    creator: "Avik Ghosh",
    theme: "dark",
    logo: "ImageIcon",
    currentPage: "home",
    modules: modules,
    sideMenuItems: sideMenuItems,
}