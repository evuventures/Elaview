import 'package:flutter/material.dart';
import 'package:mobile_app/utils/constants/image_strings.dart';
import 'package:mobile_app/utils/constants/sizes.dart';
import 'package:mobile_app/utils/constants/text_strings.dart';
import 'package:mobile_app/utils/helpers/helper_functions.dart';


class TLoginHeader extends StatelessWidget {
  const TLoginHeader({
    super.key,
  });
  @override
  Widget build(BuildContext context) {
    final dark = THelperFunctions.isDarkMode(context);
    return Column(
        // crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Elaview",
              style: Theme.of(context).textTheme.headlineLarge),
          const SizedBox(height: TSizes.defaultSpace),
          Text(TTexts.loginTitle,
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: TSizes.sm),
          Text(TTexts.loginSubTitle,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium),
        ],
      );
  }
}