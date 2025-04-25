import { useTranslation } from "react-i18next"
import "../../i18n.ts"

const View4 = () => {

  const {t} = useTranslation("modules")
  
  return (
    <div className="w-full h-[100%] p-5 overflow-y-auto fade-in">
      
      <label className="subtitle">{t("module_1.views.view_4")}</label>
      
      <div className="panel w-full h-[300px] justify-center items-center bg-[var(--tertiary-color)]">
      
      </div>

      <div className="flex w-full pb-[100px]">
        <div className="panel w-1/3 h-[1000px] me-2 mt-5 mb-5">
          {/* contents */}
        </div>

        <div className="panel w-2/3 h-[1000px] ms-2 mt-5 mb-5">
          {/* contents */}
        </div>
      </div>
          
    </div>
  )
}

export default View4
