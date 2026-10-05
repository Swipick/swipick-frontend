const { applica } = require('../withPodfilePatches');

/** Le due righe del Podfile generato su cui il plugin si aggancia. */
const PODFILE = `require File.join(File.dirname(\`node --print "require.resolve('expo/package.json')"\`), "scripts/autolinking")

target 'Swipick' do
  use_expo_modules!

  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
  use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym if ENV['USE_FRAMEWORKS']

  use_react_native!(:path => config[:reactNativePath])

  post_install do |installer|
    react_native_post_install(installer, config[:reactNativePath])
  end
end
`;

describe('withPodfilePatches', () => {
  it('dichiara i pod Google con i modular headers', () => {
    const fuori = applica(PODFILE);
    expect(fuori).toContain("pod 'GoogleUtilities', :modular_headers => true");
    expect(fuori).toContain("pod 'RecaptchaInterop', :modular_headers => true");
    expect(fuori).toContain("pod 'AppCheckCore', :modular_headers => true");
  });

  it('allinea i deployment target dentro post_install', () => {
    const fuori = applica(PODFILE);
    expect(fuori).toContain("minimo_ios = '15.1'");
    expect(fuori.indexOf('minimo_ios')).toBeGreaterThan(
      fuori.indexOf('post_install do |installer|'),
    );
  });

  it('applicato due volte non raddoppia niente', () => {
    const una = applica(PODFILE);
    const due = applica(una);
    expect(due).toBe(una);
  });

  it('grida se il Podfile generato cambia, invece di non fare niente', () => {
    // Un plugin che fallisce in silenzio produce una build rotta in cloud e
    // nessun indizio su cosa sia successo.
    expect(() => applica('target "Swipick" do\nend\n')).toThrow(
      /use_frameworks/,
    );
    expect(() =>
      applica(PODFILE.replace('post_install do |installer|', '# niente')),
    ).toThrow(/post_install/);
  });
});
