import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app/common/styles/spacing_styles.dart';
import 'package:mobile_app/common/widgets/login_sighup/form_divider.dart';
import 'package:mobile_app/common/widgets/login_sighup/social_buttons.dart';
import 'package:mobile_app/features/authentication/screens/signin/widgets/login_form.dart';
import 'package:mobile_app/features/authentication/screens/signin/widgets/login_header.dart';
import 'package:mobile_app/utils/constants/sizes.dart';
import 'package:mobile_app/utils/constants/text_strings.dart';



class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: TSpacingStyle.paddingWithAppBarHeight,
          child: Column(
            children: [
              //header
            const TLoginHeader(),
            const TLoginForm(),
            //Divider
            TFormDivider(dividerText : TTexts.orSignInWith.capitalize!),
            const SizedBox(height: TSizes.spaceBtwSections),
            //Footer
            const TSocialButtons()
            ],
          ),
        ),
      ),
    );
  }
}