import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:iconsax/iconsax.dart';
import 'package:mobile_app/utils/constants/colors.dart';
import 'package:mobile_app/utils/helpers/helper_functions.dart';


class NavigationMenu extends StatelessWidget {
  const NavigationMenu({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = NavigationController();
    final darkMode = THelperFunctions.isDarkMode(context);
    return Scaffold(
      bottomNavigationBar: Obx(
        ()=> NavigationBar(
          height: 80,
          elevation: 0,
          backgroundColor: darkMode ? TColors.black : TColors.white,
          indicatorColor: darkMode ? TColors.white.withOpacity(0.1) : TColors.black.withOpacity(0.1),
          selectedIndex: controller.selectedIndex.value,
          onDestinationSelected: (index) => controller.selectedIndex.value=index,
          destinations: const [
            NavigationDestination(icon: Icon(Iconsax.search_normal), label: "Spaces"),
            NavigationDestination(icon: Icon(Iconsax.note_text), label: "Proposals"),
            NavigationDestination(icon: Icon(Iconsax.message_text), label: "Messages"),
            NavigationDestination(icon: Icon(Iconsax.user), label: "Profile"),
          ],
        ),
      ),
      body: Obx(()=> controller.screens[controller.selectedIndex.value]),
    );
  }
}

class NavigationController extends GetxController{
  final Rx<int> selectedIndex = 0.obs;
  final screens = [Container(color: TColors.primary),Container(color: TColors.secondary),Container(color: TColors.accent),Container(color: TColors.textPrimary)];
}
