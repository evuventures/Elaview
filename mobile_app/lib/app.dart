import 'package:flutter/material.dart';
import 'package:get/get_navigation/src/root/get_material_app.dart';
import 'package:mobile_app/navigation_menu.dart';
import 'package:mobile_app/utils/constants/colors.dart';
import 'package:mobile_app/utils/constants/text_strings.dart';
import 'package:mobile_app/utils/theme/theme.dart';
import 'package:mobile_app/features/authentication/screens/signin/signin.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: TTexts.appName,
      themeMode: ThemeMode.system,
      theme: TAppTheme.lightTheme,
      darkTheme: TAppTheme.darkTheme,
      debugShowCheckedModeBanner: false,
      home: const Scaffold(body: SignInScreen(),),
      );
  }
}
