export type ThemeType = {
  name: string
  key: string
}

export type ThemeList = {
  System: ThemeType
  Light: ThemeType
  Dark: ThemeType
  SolarizedLight: ThemeType
  SolarizedDark: ThemeType
  KimbieDark: ThemeType
  Custom: ThemeType
}

declare let t: ThemeList

export default t
