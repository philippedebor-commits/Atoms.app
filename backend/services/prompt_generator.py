import logging

logger = logging.getLogger(__name__)


def generate_urbanistic_prompt(data: dict) -> str:
    """Generate an optimized prompt for Gamma based on user questionnaire data."""

    project_name = data.get("project_name", "Projet")
    applicant_name = data.get("applicant_name", "Le demandeur")
    commune = data.get("commune", "")
    postal_code = data.get("postal_code", "")
    cadastral_section = data.get("cadastral_section", "")
    parcel = data.get("parcel", "")
    land_area = data.get("land_area", "")
    land_status = data.get("land_status", "")
    environment = data.get("environment", "")
    topography = data.get("topography", "")
    vegetation = data.get("vegetation", "")
    access_info = data.get("access", "")
    destination = data.get("destination", "")
    project_type = data.get("project_type", "")
    lodge_model = data.get("lodge_model", "")
    unit_count = data.get("unit_count", "")
    finish_level = data.get("finish_level", "")
    architect_description = data.get("architect_description", "")
    layout_disposition = data.get("layout_disposition", "")
    unit_distance = data.get("unit_distance", "")
    vegetation_preservation = data.get("vegetation_preservation", "")
    parking = data.get("parking", "")
    road_access = data.get("road_access", "")
    connections = data.get("connections", "")
    project_objective = data.get("project_objective", "")
    integration_level = data.get("integration_level", "")
    environmental_commitment = data.get("environmental_commitment", "")
    maximize_acceptance = data.get("maximize_acceptance", False)

    # Build destination-specific context
    destination_context = ""
    if destination == "exploitation_touristique":
        destination_context = (
            "Ce projet s'inscrit dans une démarche d'exploitation touristique durable, "
            "privilégiant une faible densité d'occupation, une intégration harmonieuse dans "
            "le paysage naturel et le respect de l'environnement wallon. L'objectif est de "
            "proposer un hébergement de qualité qui valorise le patrimoine naturel local "
            "tout en minimisant l'impact visuel et écologique."
        )
    elif destination == "maison_habitation":
        destination_context = (
            "Ce projet de maison d'habitation vise une intégration respectueuse dans le "
            "tissu bâti existant et le paysage local. La conception architecturale s'inscrit "
            "dans la continuité du bâti environnant tout en apportant une réponse contemporaine "
            "aux enjeux d'habitabilité et de durabilité."
        )
    elif destination == "immeuble_multi_appartements":
        destination_context = (
            "Ce projet d'immeuble à appartements propose une densification maîtrisée et "
            "réfléchie du territoire. La conception privilégie une intégration volumétrique "
            "respectueuse du contexte bâti environnant, avec une attention particulière portée "
            "aux espaces communs, à la qualité de vie des résidents et à la gestion durable "
            "des ressources."
        )

    # Build project description based on type
    project_description = ""
    if project_type == "catalogue":
        project_description = (
            f"Le projet prévoit l'implantation de {unit_count or 'plusieurs'} unité(s) "
            f"de type {lodge_model or 'lodge'} issues du catalogue Belgian Lodges"
            f"{', avec un niveau de finition ' + finish_level if finish_level else ''}. "
            "Ces constructions en bois sont conçues pour s'intégrer naturellement dans "
            "leur environnement grâce à leurs matériaux biosourcés et leur architecture "
            "contemporaine respectueuse du paysage."
        )
    elif project_type == "architecte":
        project_description = (
            f"Le projet fait l'objet d'une conception architecturale sur mesure. "
            f"{architect_description or 'Le programme architectural sera détaillé dans les plans joints au dossier.'}"
        )

    # Build optimization section
    optimization = ""
    if maximize_acceptance:
        optimization = (
            "\n\nNote importante pour la rédaction : maximiser les chances d'acceptation en "
            "mettant en avant les éléments suivants dans chaque section du dossier :\n"
            "- La conformité avec le Code du Développement Territorial (CoDT)\n"
            "- Le respect du Schéma de Développement du Territoire (SDT)\n"
            "- L'intégration paysagère et architecturale\n"
            "- La durabilité environnementale et énergétique\n"
            "- La plus-value pour la commune et ses habitants\n"
            "- Les mesures compensatoires prévues\n"
            "- La réversibilité des aménagements si applicable"
        )

    prompt = f"""Crée un dossier complet de demande d'avis préalable urbanistique pour un projet situé en Région wallonne (Belgique). Le dossier doit être rédigé dans un ton administratif, neutre et rassurant, adapté à une présentation auprès du Fonctionnaire Délégué et de la commune concernée.

Titre du dossier : Demande d'avis préalable urbanistique — {project_name}

1. PAGE DE GARDE

Intitulé : Demande d'avis préalable urbanistique
Projet : {project_name}
Demandeur : {applicant_name}
Localisation : {commune} ({postal_code}), section cadastrale {cadastral_section}, parcelle {parcel}
Superficie du terrain : {land_area}
Statut foncier : {land_status}

2. NOTE DE PRÉSENTATION DU PROJET

{destination_context}

{project_description}

Le terrain se situe dans un environnement {environment}, caractérisé par une topographie {topography}. La végétation existante est composée de {vegetation}. L'accès au site se fait par {access_info}.

3. DONNÉES CADASTRALES ET SITUATION DU BIEN

Présenter de manière claire et structurée :
- La localisation précise du bien (commune de {commune}, code postal {postal_code})
- Les références cadastrales (section {cadastral_section}, parcelle {parcel})
- La superficie totale du terrain ({land_area})
- Le statut foncier actuel ({land_status})
- Le contexte urbanistique applicable (zone au plan de secteur, prescriptions communales)

4. IMPLANTATION ET AMÉNAGEMENT

La disposition des constructions sur la parcelle est de type {layout_disposition}. La distance entre les unités est de {unit_distance}. Le projet accorde une importance particulière à la préservation de la végétation existante : {vegetation_preservation}.

Générer un schéma d'implantation simplifié représentant la parcelle vue du dessus, avec des carrés colorés pour les constructions (vert pour les lodges ou habitations, gris pour les parkings, bleu pour les zones d'eau éventuelles) et des zones hachurées pour la végétation préservée. Ajouter une légende claire.

5. INFRASTRUCTURES ET RACCORDEMENTS

- Stationnement : {parking}
- Voirie et accès : {road_access}
- Raccordements aux réseaux : {connections}

Détailler les solutions techniques envisagées pour chaque infrastructure, en privilégiant les solutions durables et respectueuses de l'environnement.

6. MOTIVATION ET INTÉGRATION

Objectif du projet : {project_objective}
Niveau d'intégration paysagère visé : {integration_level}
Engagement environnemental : {environmental_commitment}

Développer une argumentation solide démontrant la pertinence du projet dans son contexte territorial, son apport socio-économique pour la commune et sa compatibilité avec les orientations du développement territorial wallon.

7. CONCLUSION

Rédiger une conclusion synthétique rappelant les points forts du projet, sa conformité avec les principes du CoDT, et formuler respectueusement la demande d'avis favorable auprès des autorités compétentes.

INSTRUCTIONS DE MISE EN FORME :
- Utiliser un design professionnel et épuré
- Couleurs sobres (vert foncé, beige, blanc)
- Typographie lisible et hiérarchisée
- Inclure le schéma d'implantation dans la section 4
- Chaque section sur une slide distincte
- Ajouter des icônes pertinentes pour illustrer les sections{optimization}"""

    return prompt